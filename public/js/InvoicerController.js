var invoicer = angular.module('invoicer', [], function($locationProvider) {
  $locationProvider.html5Mode(true);
});

invoicer.controller('Invoicer', function($scope, $location){

	var provided_inputs = $location.search().inputs;
	var inputs = (provided_inputs && JSON.parse(provided_inputs)) || {
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
		return roundAmount(amt, $scope.rounding_mode).toFixed(2);
	};

	$scope.recomputeInvoice = function()
	{
		// Prepare data for invoicer

		var settings = {
			rounding_rule: $scope.tax_rule,
			rounding_method: $scope.rounding_mode
		};
		var lines = {};
		var discounts = [];

		for(var reference in $scope.order.products)
		{
			var product = $scope.order.products[reference];
			lines['product-'+reference] = {
				quantity: product.quantity,
				unit_price: $scope.products[reference].price,
				tax_rate: $scope.taxes[$scope.order.products[reference].tax].rate,
				tax_class: 'Products'
			};

			if(product.discount && product.discount.type !== 'none')
			{
				var discount = {
					apply_to: ['product-'+reference],
					discount: product.discount
				};
				discounts.push(discount);
			}
		}

		for(var reference in $scope.order.additional)
		{
			lines['additional-'+reference] = {
				unit_price: $scope.order.additional[reference].price,
				tax_rate: $scope.taxes[$scope.order.additional[reference].tax].rate,
				tax_class: reference
			};
		}

		for(var gd in $scope.order.global_discounts)
		{
			discounts.push({
				name: gd,
				discount: $scope.order.global_discounts[gd],
				apply_to: Object.keys($scope.order.products).map(function(ref){return 'product-'+ref;}),
				show_on_line: false
			});
		}

		var data = computeInvoice(settings, lines, discounts);

		// The things we will need to fill

		/* 
		Keys = references, values = Objects with keys:
		- quantity,
		- unit_price_before_tax,
		- discount,
		- net_unit_price_before_tax,
		- line_cost_before_tax
		- tax_rate
		*/
		$scope.invoice = {};

		$scope.invoice_total = {
			total_products_before_tax: 0,
			additional_fees_before_tax: 0,
			global_discount_before_tax: 0,
			total_before_tax: 0,
			total_tax: data.tax_breakdown[null],
			total_with_tax: 0
		};

		for(var reference in $scope.order.products)
		{
			var quantity = $scope.order.products[reference].quantity;
			var line_price = data.lines['product-'+reference].line_price;

			$scope.invoice[reference] = {
				quantity: quantity,
				unit_price_before_tax: $scope.products[reference].price,
				discount: data.lines['product-'+reference].discounts_applied,
				net_unit_price_before_tax: line_price/quantity, 
				line_cost_before_tax: line_price,
				tax_rate: data.lines['product-'+reference].tax_rate
			}

			$scope.invoice_total.total_products_before_tax += line_price;
		}
		/*
		
		*/
		$scope.invoice_discounts = {};

		for(var d in data.discounts)
		{
			var discount = data.discounts[d];
			if(!discount.show_on_line)
			{
				$scope.invoice_discounts[discount.name] = {amount: discount.discount.actual_amount};
				$scope.invoice_total.global_discount_before_tax += discount.discount.actual_amount;
			}
		}

		/*
		Object with keys:
		
		*/
		$scope.additional_recap = {};
		for(var reference in $scope.order.additional)
		{
			var add = data.lines['additional-'+reference].line_price;
			$scope.additional_recap[reference] = add;
			$scope.invoice_total.additional_fees_before_tax += add;

		}
		
		$scope.invoice_total.total_before_tax =
		$scope.invoice_total.total_products_before_tax +
		$scope.invoice_total.additional_fees_before_tax -
		$scope.invoice_total.global_discount_before_tax;

		$scope.invoice_total.total_with_tax = $scope.invoice_total.total_before_tax +
		data.tax_breakdown[null];

		delete data.tax_breakdown[null];
		$scope.tax_breakdown = data.tax_breakdown;

		$scope.makeLink();
	};

	$scope.makeLink = function()
	{
		$scope.url = location.origin+"?inputs="+encodeURIComponent(angular.toJson($scope.inputs)); 
	};
});