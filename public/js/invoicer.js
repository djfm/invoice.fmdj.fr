/*
	Round a monetary amount according to the specified method
*/

function roundAmount(amount, method)
{
	if (method === 'floor')
	{
		return Math.floor(100*amount)/100;
	}
	else if (method === 'ceiling')
	{
		return Math.ceil(100*amount)/100;
	}
	else if (method === 'bankers')
	{
		var n = (amount * 100).toFixed(8); // Avoid rounding errors
		var i = Math.floor(n), f = n - i;
		var e = 1e-8; // Allow for rounding errors in f
		var r = (f > 0.5 - e && f < 0.5 + e) ? ((i % 2 === 0) ? i : i + 1) : Math.round(n);
		return r / 100;
	}
	else // default: half_up
	{
		return Math.round(100*amount)/100;
	}
}

/*
Compute an invoice.

// Input

*settings* is an associative array that controls how the invoice is generated. It has the following properties:
- rounding_rule: either 'item', 'line', or 'total'; defaults to 'line'
- rounding_method: either 'half_up', 'floor', 'ceiling', or 'bankers'

*lines* is an associative array the keys of which we will name "references",
each element of the lines array must contain the following information:
- quantity: the quantity of the product or service or additional cost represented by the line
(defaults to 1 if unspecified)
- unit_price: the unit price of the item composing the line, before tax
- unit_taxable_price: the part of the unit_price that is subject to the tax, before tax
(defaults to unit_price if unspecified)
- tax_rate: the tax rate to apply to this line, as a number between 0 included and 1 included
defaults to 0

*discounts* is an ordered array of discounts to apply to the order (in the order of the array from left to right :))
Each item in this array must have the following properties:
- apply_to: an array of "references" (from the set of references in the *lines* associative array),
if the apply_to array is empty or unspecified it is assumed the discount is on the whole order
- show_on_line: a boolean defining whether to show the discount's impact
	If unspecified, defaults to true if apply_to has length 1, false otherwise
- name (optional)
- discount: a discount object, it has the following properties:
	- type: either 'percent', 'monetary_units', or 'monetary_units_with_tax'
	- amount: a number between 0 included and 1 included in case of a 'percent' type, or any positive number else
	on the discounted lines or only in the global discounts part of the invoice.

// Output
An associative array with the following properties:
- lines: the same lines as in input, enriched with
	- discounts_applied: array of the discounts that were applied to the line specifically
	- tax_amount: the tax amount corresponding to the line, in monetary units, rounded as required by
	the rounding rule, but no more
	- line_price: the price to be paid for this line, without tax
- discounts: the same discounts as in input, enriched with the actual amount out of tax ('actual_amount') from which it reduced the order total
- tax_breakdown: an associative array with the amount of tax in monetary units as value, split by tax rate as key,
the total tax being associated to the null key

*/



function computeInvoice(settings, lines, discounts)
{
	/* 
	Initialize some variables.

	Initialize the tax base for each line. The tax base is the amount before tax
	on which the tax should be computed. It takes successive discounts into account.
	Also initialize the tax_amount: the amount of tax to be paid for the line, and price,
	the total price for the line before tax.
	*/
	for(var reference in lines)
	{
		var line = lines[reference];

		if(!line.quantity)
			line.quantity = 1;
		if(!line.unit_taxable_price && line.unit_taxable_price !== 0)
			line.unit_taxable_price = line.unit_price;
		if(!line.tax_rate)
			line.tax_rate = 0;

		line.discounts_applied = [];

		line.tax_base 
		= line.line_price 
		= line.quantity*line.unit_taxable_price;
	}

	/*
	Now apply the discounts
	*/
	for(var d in discounts)
	{
		var discount = discounts[d];
		discount.discount.actual_amount = 0;

		// Initialize
		if(discount.apply_to === undefined)
			discount.apply_to = [];

		if(discount.show_on_line === undefined)
			discount.show_on_line = (discount.apply_to.length === 1);

		// Do some real work

		// List the lines on which to apply the discount
		var apply_to = discount.apply_to.length > 0 ? discount.apply_to : Object.keys(lines);

		// Helper function so that code is easier to read
		function forEachMatchingLine(callback)
		{
			for(var a in apply_to)
			{
				var reference = apply_to[a];

				// Nothing to do if no corresponding line
				if(!lines[reference])
					continue;

				// Sum the tax base of all lines matching
				callback(lines[reference]);
			}
		};

		var tax_base = 0;

		// Compute current total tax base
		forEachMatchingLine(function(line){
			tax_base += line.tax_base;
		});

		// Update the tax bases of all the lines
		
		// Easy case first
		if(discount.discount.type === 'percent')
		{
			forEachMatchingLine(function(line){
				var tb = line.tax_base;
				line.tax_base *= (1-discount.discount.amount);
				var delta = (tb - line.tax_base);

				discount.discount.actual_amount += delta;

				if(discount.show_on_line)
				{
					// Since we want to show the discount on the line, update the line price
					line.line_price -= delta;

					line.discounts_applied.push({
						type: 'percent',
						amount: discount.discount.amount
					});
				}
			});
		}
		// Harder case of discounts specified in monetary units
		else
		{
			var amount = discount.discount.amount; // this is in monetary units, but maybe with tax
			if(discount.discount.type === 'monetary_units_with_tax')
			{
				// compute discount amount without tax
				var amount_without_tax = 0;
				forEachMatchingLine(function(line){
					amount_without_tax += (line.tax_base / tax_base) * amount / (1+line.tax_rate);
				});
				// Set things right, we hate tax inclusive amounts
				amount = amount_without_tax;
			}

			// Now that we have an amount out of tax, we can play
			// First cap the amount if it exceeds tax_base (can't reduce to negative values!)
			amount = Math.min(tax_base, amount);

			// Then spread it across matching lines!
			forEachMatchingLine(function(line){
				var delta = (line.tax_base / tax_base) * amount;
				line.tax_base -= delta;
				discount.discount.actual_amount += delta;
				if(discount.show_on_line)
				{
					line.line_price -= delta;
					line.discounts_applied.push({
						type: 'monetary_units',
						amount: delta
					});
				}
			});
		}
	}

	/*
	Now that discounts have been safely applied before tax, we can compute tax!
	*/
	var tax_breakdown = {};
	for(var reference in lines)
	{
		var line = lines[reference];
		
		if(settings.rounding_rule === 'item')
		{
			line.tax_amount = roundAmount(line.tax_base/line.quantity*line.tax_rate, settings.rounding_method)*line.quantity;
		}
		else if(settings.rounding_rule === 'total')
		{
			line.tax_amount = line.tax_base * line.tax_rate;
		}
		else // 'line' rule, no if because default rule
		{
			line.tax_amount = roundAmount(line.tax_base * line.tax_rate, settings.rounding_method);
		}

		var taxpct = (100*line.tax_rate).toFixed(2)+'%';
		var taxname = line.tax_class ? line.tax_class+': '+taxpct : taxpct;

		tax_breakdown[taxname] = (tax_breakdown[taxname] || 0) + line.tax_amount;
		tax_breakdown[null] = (tax_breakdown[null] || 0) + line.tax_amount;
	}

	// All done!
	return {
		lines: lines,
		discounts: discounts,
		tax_breakdown: tax_breakdown
	};
};

