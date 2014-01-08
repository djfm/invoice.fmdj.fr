<!doctype html>
<html class="no-js" lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Invoicer Demo</title>
    <link rel="stylesheet" href="/public/vendor/foundation/css/foundation.css" />
    <link rel="stylesheet" href="/public/css/invoicer.css" />
    <script src="/public/vendor/foundation/js/modernizr.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.2.7/angular.min.js"></script>
    <script src="/public/js/invoicer.js"></script>
  </head>
  <body ng-app='invoicer' ng-controller='Invoicer'>
    <div class="row">
      <div class="large-12 columns">
        <h1>Invoicer POC</h1>
      </div>
    </div>
    
    <div class="row">
      <div class="large-12 columns">
      	<div class="panel">
	       <h3>Welcome!</h3>
	       <p>This tool will show you samples of invoice calculation.</p>
      	</div>
      </div>
    </div>
	
	<div class="row">
		<div class="large-12 columns">
			<div class="panel">
				<h3>Products</h3>
				
				<div id="products"  class="table">
					<div class="row table-header">
						<div class="large-3 columns">
							Reference
						</div>
						<div class="large-9 columns">
							Price
						</div>
					</div>
					<div class="row table-row" ng-repeat='(reference, product) in products'>
						<div class="large-3 columns">
							{{reference}}
						</div>
						<div class="large-7 columns">
							<input type="number" step="0.1" ng-model="product.price">
						</div>
						<div class="large-2 columns">
							<button class="postfix alert" ng-click="deleteProduct(reference)">-</button>
						</div>
					</div>
					<form ng-submit='createProduct()'>
						<div class="row">
							<div class="large-3 columns">
								<input required ng-model='new_product_reference' type="text">
							</div>
							<div class="large-7 columns">
								<input required ng-model='new_product_price' type="number" step="0.1">
							</div>
							<div class="large-2 columns">
								<button class="postfix success">+</button>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
	</div>

	<div class="row">
		<div class="large-12 columns">
			<div class="panel">
				<h3>Taxes</h3>
				
				<div id="taxes" class="table">
					<div class="row table-header">
						<div class="large-3 columns">
							Name
						</div>
						<div class="large-9 columns">
							Amount
						</div>
					</div>
					<div class="row table-row" ng-repeat='(name, tax) in taxes'>
						<div class="large-3 columns">
							{{name}}
						</div>
						<div class="large-7 columns">
							<input ng-model="tax.rate" type="number" step="0.01">
						</div>
						<div class="large-2 columns">
							<button class="postfix alert" ng-click="deleteTax(name)">-</button>
						</div>
					</div>
					<form ng-submit='createTax()'>
						<div class="row">
							<div class="large-3 columns">
								<input required ng-model='new_tax_name' type="text">
							</div>
							<div class="large-7 columns">
								<input required ng-model='new_tax_amount' type="number" step="0.01">
							</div>
							<div class="large-2 columns">
								<button class="postfix success">+</button>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
	</div>
	
	<div class="row">
		<div class="large-12 columns">
			<div class="panel">
				<h3>Order - Products</h3>
				
				<div id="order" class="table">
					<div class="row table-header">
						<div class="large-2 columns">
							Reference
						</div>
						<div class="large-2 columns">
							Quantity
						</div>
						<div class="large-2 columns">
							Tax
						</div>
						<div class="large-2 columns">
							Discount
						</div>
						<div class="large-4 columns">
							Discount Amount
						</div>
					</div>
					<div class="row table-row" ng-repeat='(reference, details) in order.products'>
						<div class="large-2 columns">
							{{reference}}
						</div>
						<div class="large-2 columns">
							<input ng-model="details.quantity" type="number" step="1">
						</div>
						<div class="large-2 columns">
							<select ng-options="key as key for (key, value) in taxes" ng-model="details.tax"></select>
						</div>
						<div class="large-2 columns">
							<select ng-options="key as value for (key, value) in discount_types" ng-model="details.discount.type"></select>
						</div>
						<div class="large-2 columns">
							<input type="number" step="any" ng-model="details.discount.amount">
						</div>
						<div class="large-2 columns">
							<button class="postfix alert" ng-click="deleteOrderProductLine(reference)">-</button>
						</div>
					</div>
					<form>
						<div class="row table-row">
							<div class="large-2 columns">
								<select required ng-options="key as key for (key, value) in products" ng-model="new_order_product_reference"></select>
							</div>
							<div class="large-2 columns">
								<input required ng-model="new_order_product_quantity" type="number" step="1">
							</div>
							<div class="large-2 columns">
								<select required ng-options="key as key for (key, value) in taxes" ng-model="new_order_product_tax"></select>
							</div>
							<div class="large-2 columns">
								<select required ng-options="key as value for (key, value) in discount_types" ng-model="new_order_product_discount_type"></select>
							</div>
							<div class="large-2 columns">
								<input required type="number" step="any" ng-model="new_order_product_discount_amount">
							</div>
							<div class="large-2 columns">
								<button class="postfix success" ng-click="createOrderProductLine()">+</button>
							</div>
						</div>
					</form>
					
					<h3>Order - Additional</h3>
				
					<div class="row table-header">
						<div class="large-4 columns">
							Additional Fee
						</div>
						<div class="large-4 columns">
							Price (Before Tax)
						</div>
						<div class="large-4 columns">
							Tax
						</div>
					</div>
					<div class="row table-row" ng-repeat='(reference, details) in order.additional'>
						<div class="large-4 columns">
							{{reference}}
						</div>
						<div class="large-4 columns">
							<input type="number" step="0.1" ng-model="details.price">
						</div>
						<div class="large-2 columns">
							<select ng-options="key as key for (key, value) in taxes" ng-model="details.tax"></select>
						</div>
						<div class="large-2 columns">
							<button class="postfix alert" ng-click="deleteOrderAdditionalLine(reference)">-</button>
						</div>
					</div>
					<form>
						<div class="row table-row">
							<div class="large-4 columns">
								<input required type="text" ng-model="new_order_additional_reference">
							</div>
							<div class="large-4 columns">
								<input required type="number" step="0.1" ng-model="new_order_additional_price">
							</div>
							<div class="large-2 columns">
								<select required ng-options="key as key for (key, value) in taxes" ng-model="new_order_additional_tax"></select>
							</div>
							<div class="large-2 columns">
								<button class="postfix success" ng-click="createOrderAdditionalLine(reference)">+</button>
							</div>
						</div>
					</form>

					<h3>Order - Global Discounts</h3>
			
					<div class="row table-header">
						<div class="large-4 columns">
							Discount Name
						</div>
						<div class="large-3 columns">
							Discount Type
						</div>
						<div class="large-5 columns">
							Discount Amount
						</div>
					</div>
					<div class="row table-row" ng-repeat='(reference, details) in order.global_discounts'>
						<div class="large-4 columns">
							{{reference}}
						</div>
						<div class="large-3 columns">
							<select ng-options="key as value for (key, value) in discount_types" ng-model="details.type"></select>
						</div>
						<div class="large-3 columns">
							<input type="number" step="any" ng-model="details.amount">
						</div>
						<div class="large-2 columns">
							<button class="postfix alert" ng-click="deleteOrderGlobalDiscount(reference)">-</button>
						</div>
					</div>
					<form>
						<div class="row table-row">
							<div class="large-4 columns">
								<input required type="text" ng-model="new_global_discount_name">
							</div>
							<div class="large-3 columns">
								<select required ng-options="key as value for (key, value) in discount_types" ng-model="new_global_discount_type"></select>
							</div>
							<div class="large-3 columns">
								<input required type="number" step="any" ng-model="new_global_discount_amount">
							</div>
							<div class="large-2 columns">
								<button class="postfix success" ng-click="createOrderGlobalDiscount()">+</button>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
	</div>

	<div class="row">
		<div class="large-12 columns">
			<div class="panel">
				<h3>Invoice</h3>
				
				<div id="invoice" class="table">
					<div class="row table-header">
						<div class="large-2 columns">
							Reference
						</div>
						<div class="large-1 columns">
							Quantity
						</div>
						<div class="large-2 columns">
							Unit Price<BR/>(Before Tax)
						</div>
						<div class="large-2 columns">
							Discount
						</div>
						<div class="large-2 columns">
							Net Unit Price<BR/>(Before Tax)
						</div>
						<div class="large-2 columns">
							Line Cost<BR/>(Before Tax)
						</div>
						<div class="large-1 columns">
							Tax Rate
						</div>
					</div>
				</div>

				<button class="success" ng-click='recomputeInvoice()'>Re Compute Invoice!</button>

			</div>
		</div>
	</div>
    
    <script src="/public/vendor/foundation/js/jquery.js"></script>
    <script src="/public/vendor/foundation/js/foundation.min.js"></script>
    <script>
    	$(document).foundation();
    </script>
  </body>
</html>

