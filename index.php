<!doctype html>
<html class="no-js" lang="en">
  <head>
    <meta charset="utf-8" />
    <!--meta name="viewport" content="width=device-width, initial-scale=1.0" /-->
    <title>Invoicer Demo</title>
    <link rel="stylesheet" href="/public/vendor/foundation/css/foundation.css" />
    <link rel="stylesheet" href="/public/css/invoicer.css" />
    <script src="/public/vendor/foundation/js/modernizr.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.2.7/angular.min.js"></script>
    <script src="/public/js/invoicer.js"></script>
    <script src="/public/js/InvoicerController.js"></script>
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
	       <p>
	       	This tool is used to demonstrate how invoices should be computed according to different parameters.
	       	<BR/>
	       	Click on the titles to open the sections!
	       </p>
      	</div>
      </div>
    </div>
	
	<div class="row">
		<div class="large-12 columns">
			<div class="panel">
				<h3 class="collapsible collapsed">Products</h3>
				
				<div id="products"  class="table">
					<div class="row table-header">
						<div class="small-3 columns">
							Reference
						</div>
						<div class="small-9 columns">
							Price
						</div>
					</div>
					<div class="row table-row" ng-repeat='(reference, product) in products'>
						<div class="small-3 columns">
							{{reference}}
						</div>
						<div class="small-7 columns">
							<input type="number" step="any" ng-model="product.price">
						</div>
						<div class="small-2 columns">
							<button class="postfix alert" ng-click="deleteProduct(reference)">-</button>
						</div>
					</div>
					<form ng-submit='createProduct()'>
						<div class="row">
							<div class="small-3 columns">
								<input required ng-model='new_product_reference' type="text">
							</div>
							<div class="small-7 columns">
								<input required ng-model='new_product_price' type="number" step="any">
							</div>
							<div class="small-2 columns">
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
				<h3 class="collapsible collapsed">Taxes</h3>
				
				<div id="taxes" class="table">
					<div class="row table-header">
						<div class="small-3 columns">
							Name
						</div>
						<div class="small-9 columns">
							Amount
						</div>
					</div>
					<div class="row table-row" ng-repeat='(name, tax) in taxes'>
						<div class="small-3 columns">
							{{name}}
						</div>
						<div class="small-7 columns">
							<input ng-model="tax.rate" type="number" step="any">
						</div>
						<div class="small-2 columns">
							<button class="postfix alert" ng-click="deleteTax(name)">-</button>
						</div>
					</div>
					<form ng-submit='createTax()'>
						<div class="row">
							<div class="small-3 columns">
								<input required ng-model='new_tax_name' type="text">
							</div>
							<div class="small-7 columns">
								<input required ng-model='new_tax_amount' type="number" step="any">
							</div>
							<div class="small-2 columns">
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
				<h3 class="collapsible collapsed">Order - Products</h3>
				
				<div id="order-products" class="table">
					<div class="row table-header">
						<div class="small-2 columns">
							Reference
						</div>
						<div class="small-2 columns">
							Quantity
						</div>
						<div class="small-2 columns">
							Tax
						</div>
						<div class="small-2 columns">
							Discount
						</div>
						<div class="small-4 columns">
							Discount Amount
						</div>
					</div>
					<div class="row table-row" ng-repeat='(reference, details) in order.products'>
						<div class="small-2 columns">
							{{reference}}
						</div>
						<div class="small-2 columns">
							<input ng-model="details.quantity" type="number" step="1">
						</div>
						<div class="small-2 columns">
							<select ng-options="key as key for (key, value) in taxes" ng-model="details.tax"></select>
						</div>
						<div class="small-2 columns">
							<select ng-options="key as value for (key, value) in discount_types" ng-model="details.discount.type"></select>
						</div>
						<div class="small-2 columns">
							<input type="number" step="any" ng-model="details.discount.amount">
						</div>
						<div class="small-2 columns">
							<button class="postfix alert" ng-click="deleteOrderProductLine(reference)">-</button>
						</div>
					</div>
					<form>
						<div class="row table-row">
							<div class="small-2 columns">
								<select required ng-options="key as key for (key, value) in products" ng-model="new_order_product_reference"></select>
							</div>
							<div class="small-2 columns">
								<input required ng-model="new_order_product_quantity" type="number" step="1">
							</div>
							<div class="small-2 columns">
								<select required ng-options="key as key for (key, value) in taxes" ng-model="new_order_product_tax"></select>
							</div>
							<div class="small-2 columns">
								<select required ng-options="key as value for (key, value) in discount_types" ng-model="new_order_product_discount_type"></select>
							</div>
							<div class="small-2 columns">
								<input required type="number" step="any" ng-model="new_order_product_discount_amount">
							</div>
							<div class="small-2 columns">
								<button class="postfix success" ng-click="createOrderProductLine()">+</button>
							</div>
						</div>
					</form>
				</div>
					
				<h3 class="collapsible collapsed">Order - Additional</h3>
				<div id='order-additional'>
					<div class="row table-header">
						<div class="small-4 columns">
							Additional Fee
						</div>
						<div class="small-4 columns">
							Price (Before Tax)
						</div>
						<div class="small-4 columns">
							Tax
						</div>
					</div>
					<div class="row table-row" ng-repeat='(reference, details) in order.additional'>
						<div class="small-4 columns">
							{{reference}}
						</div>
						<div class="small-4 columns">
							<input type="number" step="any" ng-model="details.price">
						</div>
						<div class="small-2 columns">
							<select ng-options="key as key for (key, value) in taxes" ng-model="details.tax"></select>
						</div>
						<div class="small-2 columns">
							<button class="postfix alert" ng-click="deleteOrderAdditionalLine(reference)">-</button>
						</div>
					</div>
					<form>
						<div class="row table-row">
							<div class="small-4 columns">
								<input required type="text" ng-model="new_order_additional_reference">
							</div>
							<div class="small-4 columns">
								<input required type="number" step="any" ng-model="new_order_additional_price">
							</div>
							<div class="small-2 columns">
								<select required ng-options="key as key for (key, value) in taxes" ng-model="new_order_additional_tax"></select>
							</div>
							<div class="small-2 columns">
								<button class="postfix success" ng-click="createOrderAdditionalLine(reference)">+</button>
							</div>
						</div>
					</form>
				</div>

				<h3 class="collapsible collapsed">Order - Global Discounts</h3>
				<div id='order-discounts'>
					<div class="row table-header">
						<div class="small-4 columns">
							Discount Name
						</div>
						<div class="small-3 columns">
							Discount Type
						</div>
						<div class="small-5 columns">
							Discount Amount
						</div>
					</div>
					<div class="row table-row" ng-repeat='(reference, details) in order.global_discounts'>
						<div class="small-4 columns">
							{{reference}}
						</div>
						<div class="small-3 columns">
							<select ng-options="key as value for (key, value) in discount_types" ng-model="details.type"></select>
						</div>
						<div class="small-3 columns">
							<input type="number" step="any" ng-model="details.amount">
						</div>
						<div class="small-2 columns">
							<button class="postfix alert" ng-click="deleteOrderGlobalDiscount(reference)">-</button>
						</div>
					</div>
					<form>
						<div class="row table-row">
							<div class="small-4 columns">
								<input required type="text" ng-model="new_global_discount_name">
							</div>
							<div class="small-3 columns">
								<select required ng-options="key as value for (key, value) in discount_types" ng-model="new_global_discount_type"></select>
							</div>
							<div class="small-3 columns">
								<input required type="number" step="any" ng-model="new_global_discount_amount">
							</div>
							<div class="small-2 columns">
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
				<h3 class="collapsible">Invoice</h3>
				<div id="invoice">
					<div class="row">
						<div class="large-6 columns">
							<div class="row collapse">
								<div class="small-6 columns"><label for="tax_rule" class="prefix">Tax Rule</label></div>
								<div class="small-6 columns">
									<select id="tax_rule" ng-model='inputs.tax_rule' ng-options='key as value for (key, value) in tax_rules'></select>
								</div>
							</div>
						</div>
						<div class="large-6 columns">
							<div class="row collapse">
								<div class="small-6 columns"><label for="rounding_mode" class="prefix">Rounding Mode</label></div>
								<div class="small-6 columns">
									<select id="rounding_mode" ng-model='inputs.rounding_mode' ng-options='key as value for (key, value) in rounding_modes'></select>
								</div>
							</div>
						</div>
					</div>
					
					<div id="invoice" class="table">
						<div class="row table-header">
							<div class="small-2 columns">
								Reference
							</div>
							<div class="small-1 columns">
								Quantity
							</div>
							<div class="small-2 columns">
								Unit Price<BR/>(Before Tax)
							</div>
							<div class="small-2 columns">
								Discount
							</div>
							<div class="small-2 columns">
								Net Unit Price<BR/>(Before Tax)
							</div>
							<div class="small-2 columns">
								Line Cost<BR/>(Before Tax)
							</div>
							<div class="small-1 columns">
								Tax Rate
							</div>
						</div>
						<div class="row table-row" ng-repeat='(reference, line) in invoice'>
							<div class="small-2 columns">
								{{reference}}
							</div>
							<div class="small-1 columns">
								{{line.quantity}}
							</div>
							<div class="small-2 columns">
								{{line.unit_price_before_tax}}
							</div>
							<div class="small-2 columns">
								<div ng-repeat='discount in line.discount'>
									<div ng-if="discount.type === 'percent'">
										- {{(discount.amount*100).toFixed(2)}}%
									</div>
									<div ng-if="discount.type !== 'percent'">
										- {{discount.amount}} m.u.
									</div>
								</div>
								<div ng-if='!line.discount || line.discount.length  === 0'>&nbsp;</div>
							</div>
							<div class="small-2 columns">
								{{line.net_unit_price_before_tax}}
							</div>
							<div class="small-2 columns">
								{{line.line_cost_before_tax}}
							</div>
							<div class="small-1 columns">
								{{(line.tax_rate*100).toFixed(2)}}%
							</div>
						</div>
						<div class="row table-row discount" ng-repeat='(reference, line) in invoice_discounts'>
							<div class="small-9 columns">
								{{reference}}
							</div>
							<div class="small-3 columns">
								- {{roundAmount(line.amount)}}
							</div>
							
						</div>
						<div class="row" id="invoice-summaries">
							<div class="large-6 columns" id="tax_breakdown">
								<div class="row">
									<div class="large-12 columns">
										<h4>Tax Breakdown</h4>
									</div>
								</div>
								<div class="summary">
									<div class="row collapse" ng-repeat="(rate, amount) in tax_breakdown">
										<div class="small-6 columns">
											<label class="prefix recap-header">
												{{rate}}
											</label>
										</div>
										<div class="small-6 columns">
											<label class="postfix recap-details">
												{{roundAmount(amount)}}
											</label>
										</div>
									</div>
								</div>
							</div>
							<div class="large-6 columns" id="invoice_total">
								<div class="row">
									<div class="large-12 columns">
										<h4>Invoice Summary</h4>
									</div>
								</div>
								<div class="summary">
									<div class="row collapse">
										<div class="small-6 columns">
											<label class="prefix recap-header">
												Total Products Before Tax
											</label>
										</div>
										<div class="small-6 columns">
											<label class="postfix recap">
												{{invoice_total.total_products_before_tax}}
											</label>
										</div>
									</div>
									<div class="row collapse" ng-repeat="(reference, price) in additional_recap">
										<div class="small-6 columns">
											<label class="prefix recap-header">
												{{reference}}
											</label>
										</div>
										<div class="small-6 columns">
											<label class="postfix recap-details">
												{{price}}
											</label>
										</div>
									</div>
									<div class="row collapse">
										<div class="small-6 columns">
											<label class="prefix recap-header">
												Additional Fees Before Tax
											</label>
										</div>
										<div class="small-6 columns">
											<label class="postfix recap">
												{{invoice_total.additional_fees_before_tax}}
											</label>
										</div>
									</div>
									<div class="row collapse">
										<div class="small-6 columns">
											<label class="prefix recap-header">
												Global Discounts Before Tax
											</label>
										</div>
										<div class="small-6 columns">
											<label class="postfix recap">
												- {{roundAmount(invoice_total.global_discount_before_tax)}}
											</label>
										</div>
									</div>
									<div class="row collapse">
										<div class="small-6 columns">
											<label class="prefix recap-header">
												Total Before Tax
											</label>
										</div>
										<div class="small-6 columns">
											<label class="postfix recap">
												{{roundAmount(invoice_total.total_before_tax)}}
											</label>
										</div>
									</div>
									<div class="row collapse">
										<div class="small-6 columns">
											<label class="prefix recap-header">
												Total Tax
											</label>
										</div>
										<div class="small-6 columns">
											<label class="postfix recap">
												{{roundAmount(invoice_total.total_tax)}}
											</label>
										</div>
									</div>
									<div class="row collapse">
										<div class="small-6 columns">
											<label class="prefix recap-header">
												Total To Pay With Tax
											</label>
										</div>
										<div class="small-6 columns">
											<label class="postfix recap">
												{{roundAmount(invoice_total.total_with_tax)}}
											</label>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					<p><a href="{{url}}">Link to This Invoice</a></p>
				</div>
			</div>
		</div>
	</div>
    
    <script src="/public/vendor/foundation/js/jquery.js"></script>
    <script src="/public/vendor/foundation/js/foundation.min.js"></script>
    <script>
    	$(document).foundation();
    	$(document).ready(function(){
    		$('.collapsible').click(function(){
    			var me = $(this);
    			me.toggleClass('collapsed');
    		});
    	});
    </script>
  </body>
</html>

