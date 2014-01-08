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
					type: 'monetary_units',
					amount: 4
				}
			}
			
		},

		discount_types: {
			none: 'None',
			monetary_units: 'Money',
			percent: 'Percent'
		}
	};

	for(var i in inputs)
	{
		$scope[i] = inputs[i];
	}

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

	$scope.recomputeInvoice = function()
	{
	};

	$scope.recomputeInvoice();
});