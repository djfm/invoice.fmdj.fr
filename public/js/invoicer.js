var invoicer = angular.module('invoicer', []);

invoicer.controller('Invoicer', function($scope){

	var inputs = {
		products: {
			'PrestaShop Mug': {
				price: 10
			},
			'Ukulele': {
				price: 50
			},
			'TV Screen': {
				price: 150
			}
		},

		taxes: {
			'Standard Rate': {rate: 0.2},
			'Reduced Rate': {rate: 0.1},
			'Super Reduced Rate': {rate: 0.07}
		},

		order: {
			products: {
				'PrestaShop Mug': {
					quantity: 3,
					tax: 'Standard Rate',
					discount: {
						type: 'percent',
						amount: 0.1
					}
				},
				'Ukulele': {
					quantity: 2,
					tax: 'Reduced Rate',
					discount: {
						type: 'none',
						amount: 10
					}
				},
				'TV Screen': {
					quantity: 1,
					tax: 'Standard Rate',
					discount: {
						type: 'monetary_units',
						amount: 10
					}
				}
			},
			additional: {
				'Shipping': {
					price: 5,
					tax: 'Super Reduced Rate'
				},
				'Gift Wrapping': {
					price: 2,
					tax: 'Super Reduced Rate'
				}
			},
			global_discounts: {
				'Lucky You': {
					type: 'percent',
					amount: 0.15
				},
				'Free Stuffz': {
					type: 'monetary_units_with_tax',
					amount: 4
				}
			}
		},
		tax_rule: 'total',
		rounding_mode: 'half_up'
	};

	for(var i in inputs)
	{
		$scope[i] = inputs[i];
	}

	$scope.inputs = inputs;
	$scope.$watch('inputs', function(){
		$scope.recomputeInvoice();
	}, true);

	$scope.discount_types = {
		none: 'None',
		percent: 'Percent',
		monetary_units: 'Money',
		monetary_units_with_tax: 'Money (tax included)'
	};

	$scope.tax_rules = {
		item: 'Item',
		line: 'Line',
		total: 'Total'
	};

	$scope.rounding_modes = {
		half_up: 'Half Up',
		bankers: 'Banker\'s',
		inferior: 'Inferior',
		superior: 'Superior'
	};

	$scope.createProduct = function()
	{
		$scope.products[$scope.new_product_reference] = {
			price: $scope.new_product_price
		}
	};

	$scope.createTax = function()
	{
		$scope.taxes[$scope.new_tax_name] = {
			rate: $scope.new_tax_amount
		}
	};

	$scope.createOrderProductLine = function()
	{
		$scope.order.products[$scope.new_order_product_reference] = {
			quantity: $scope.new_order_product_quantity,
			tax: $scope.new_order_product_tax,
			discount: {
				type: $scope.new_order_product_discount_type,
				amount: $scope.new_order_product_discount_amount
			}
		}
	};

	$scope.createOrderAdditionalLine = function()
	{
		$scope.order.additional[$scope.new_order_additional_reference] = {
			price: $scope.new_order_additional_price,
			tax: $scope.new_order_additional_tax
		};
	};

	$scope.createOrderGlobalDiscount = function()
	{
		$scope.order.global_discounts[$scope.new_global_discount_name] = {
			type: $scope.new_global_discount_type,
			amount: $scope.new_global_discount_amount
		};
	};

	$scope.deleteProduct = function(reference)
	{
		delete $scope.products[reference];
	};

	$scope.deleteTax = function(name)
	{
		delete $scope.taxes[name];
	};

	$scope.deleteOrderProductLine = function(reference)
	{
		delete $scope.order.products[reference];
	};

	$scope.deleteOrderAdditionalLine = function(reference)
	{
		delete $scope.order.additional[reference];
	};

	$scope.deleteOrderGlobalDiscount = function(reference)
	{
		delete $scope.order.global_discounts[reference];
	};

	$scope.roundAmount = function (amt)
	{
		return Math.round(100*amt)/100
	};

	$scope.recomputeInvoice = function()
	{
		$scope.invoice = {};
		
		$scope.invoice_total = {
			total_products_before_tax: 0,
			additional_fees_before_tax: 0
		};

		$scope.additional_recap = {

		};

		// Lines Total Before Tax
		var ltbf = 0;
		var price_lines = {
			products: {

			},
			additional: {

			}
		}

		function foreachPriceLine(callback)
		{
			var types = ['products', 'additional'];
			for(var t in types)
			{
				var type = types[t];
				for(var w in price_lines[type])
				{
					var line = price_lines[type][w];
					callback(type, line);
				}
			}
		};

		for(var reference in $scope.order.products)
		{
			var product = $scope.products[reference];
			var details = $scope.order.products[reference];
			
			var tax_rate = $scope.taxes[$scope.order.products[reference].tax].rate;

			var details_discount = details.discount.amount;

			// Net Unit Price Before Tax
			var nupbt = product.price;
			if(details.discount.type === 'percent')
			{
				nupbt *= (1-details.discount.amount);
			}
			else if(details.discount.type === 'monetary_units')
			{
				nupbt -= details.discount.amount;
			}
			else if(details.discount.type === 'monetary_units_with_tax')
			{
				nupbt -= details.discount.amount / (1+tax_rate);
				details_discount = details_discount / (1+tax_rate);
			}

			details.discount.net_amount = $scope.roundAmount(details_discount);

			// Line Cost Before Tax
			var lcbt = nupbt*details.quantity;
			// Line Cost Before Tax Before Discounts
			var lcbtbt = product.price*details.quantity;
			ltbf += lcbtbt;
			price_lines.products[reference] = {
				amount: lcbtbt,
				weight: 0,
				tax_rate: tax_rate,
				tax_base: lcbt,
				quantity: details.quantity
			};

			$scope.invoice[reference] = {
				quantity: details.quantity,
				unit_price_before_tax: $scope.roundAmount(product.price),
				discount: details.discount,
				net_unit_price_before_tax: $scope.roundAmount(nupbt),
				lcbtbt: lcbtbt,
				line_cost_before_tax: $scope.roundAmount(lcbt),
				tax_rate: tax_rate
			};

			$scope.invoice_total.total_products_before_tax
			+= lcbt;
		}

	
		for(var reference in $scope.order.additional)
		{
			var details = $scope.order.additional[reference];
			$scope.additional_recap[reference] = $scope.roundAmount(details.price);
			$scope.invoice_total.additional_fees_before_tax += details.price;
			price_lines.additional[reference] = {
				amount: details.price,
				weight: 0,
				tax_rate: $scope.taxes[details.tax].rate,
				tax_base: details.price,
				quantity: 1
			}
		}


		$scope.invoice_total.total_before_tax = 
		$scope.invoice_total.total_products_before_tax
		+ $scope.invoice_total.additional_fees_before_tax;

		ltbf += $scope.invoice_total.additional_fees_before_tax;

		foreachPriceLine(function(type, lw){
			lw.weight = lw.amount / ltbf;
		});

		/* Compute Global Discounts */
		var total = $scope.invoice_total.total_before_tax;
		var global_discount = 0;
		$scope.invoice_discounts = {}; 
		for(var reference in $scope.order.global_discounts)
		{
			var discount;
			var details = $scope.order.global_discounts[reference];
			if(details.type === 'percent')
			{
				discount = details.amount*total;
			}
			else if(details.type === 'monetary_units')
			{
				discount = details.amount;
			}
			else if(details.type === 'monetary_units_with_tax')
			{
				var amount_before_tax = 0;
				foreachPriceLine(function(type, line){
					amount_before_tax += details.amount * line.weight / (1+line.tax_rate);
				});
				discount = amount_before_tax;
			}

			global_discount += discount;
			var ref = reference;
			if(details.type === 'percent')
			{
				ref+= " (-"+(100*details.amount).toFixed(2)+"%)";
			}
			$scope.invoice_discounts[ref] = {
				amount: discount
			};
		}
		$scope.invoice_total.global_discount_before_tax = global_discount;
		$scope.invoice_total.total_before_tax -= global_discount;

		$scope.tax_breakdown = {};
		var total_tax = 0;
		foreachPriceLine(function(type, lw){
			if($scope.tax_rule === 'total')
			{
				lw.tax = (lw.tax_base-lw.weight*global_discount)*lw.tax_rate;
			}
			else if($scope.tax_rule === 'line')
			{
				lw.tax = $scope.roundAmount((lw.tax_base-lw.weight*global_discount)*lw.tax_rate);
			}
			else if($scope.tax_rule === 'item')
			{
				lw.tax = lw.quantity*$scope.roundAmount((lw.tax_base-lw.weight*global_discount)*lw.tax_rate/lw.quantity);
			}
			total_tax += lw.tax;
			$scope.tax_breakdown[lw.tax_rate] = 
			($scope.tax_breakdown[lw.tax_rate] || 0) + lw.tax;
		});
		$scope.invoice_total.total_tax = total_tax;

		// Round final amounts
		$scope.invoice_total.total_with_tax = $scope.roundAmount(
			$scope.invoice_total.total_before_tax
			+ $scope.invoice_total.total_tax
		);
		$scope.invoice_total.total_products_before_tax = 
		$scope.roundAmount($scope.invoice_total.total_products_before_tax);
		$scope.invoice_total.additional_fees_before_tax =
		$scope.roundAmount($scope.invoice_total.additional_fees_before_tax);
		$scope.invoice_total.total_before_tax =
		$scope.roundAmount($scope.invoice_total.total_before_tax);
		$scope.invoice_total.global_discount_before_tax =
		$scope.roundAmount($scope.invoice_total.global_discount_before_tax);
		$scope.invoice_total.total_tax =
		$scope.roundAmount($scope.invoice_total.total_tax);
	};

	//$scope.recomputeInvoice();
});