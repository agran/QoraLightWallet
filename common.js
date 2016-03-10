
	var nodeUrl = 'http://mirror.qora.co.in:9090';

	$(document).ready(function() {
		$("#menu").html(
		  '<a href="http://qora.co.in/light"><img height=107 width=93 src="qora.png"></a>'
		+ '<br><br><b>'
		+ '<a href=brainwallet.html>BrainWallet</a> | '
		+ '<a href=payment.html>Payment</a> | '
		+ '<a href=arbitrarytransaction.html>ArbitraryTransaction</a> | '
		+ '<a href=registername.html>RegisterName</a> | '
		+ '<a href=http://mirror.qora.co.in:9090/index/blockexplorer.html>BlockExplorer</a>'
		+ '</b>');
		
		$("#bottom").html('(c) <a href="mailto:agran@agran.net">agran</a><br>QTz6fSV2VNc2wjwwsw57kwQzgQhmGw5idQ');

	});


	function doLoadBalance(base58SenderAccountAddress, elementAccountbalance)
	{
		if(base58SenderAccountAddress == '') {
			elementAccountbalance.val('');
			return;
		}
		
		var nodeUrl = $("#nodeUrl").val();

		$.post( nodeUrl + "/index/api.html", { type: "get", apiurl: "/addresses/balance/" + base58SenderAccountAddress } )
			.done(function( data ) {
				
				if(data.type == 'success'){
					var balanceOfAccount = data.result;
					elementAccountbalance.val(addCommas(balanceOfAccount));
				}
				
				if(data.type == 'apicallerror'){
					$("#output").val(parseError(data.errordetail));
					elementAccountbalance.val('');
				}
				
			})
			.fail(function() {
				$("#output").val( "error" );
			});
	}

	function doLoadInfoForName(name, elementNameInfo)
	{
		if(name == '') {
			elementNameInfo.val('');
			return;
		}
		
		if( name.toLowerCase() != name ) {
			elementNameInfo.val('You must use lowercase letters.');
			return;
		}
		
		var nodeUrl = $("#nodeUrl").val();

		$.post( nodeUrl + "/index/api.html", { type: "get", apiurl: "/names/" + encodeURIComponent(name) } )
			.done(function( data ) {
				
				if(data.type == 'success'){
					var info = JSON.parse(data.result);
					elementNameInfo.val("Registered by " + info.owner);
				}
				
				if(data.type == 'apicallerror'){
					if(parseError(data.errordetail) == 'name does not exist') {
						elementNameInfo.val('Name is free. You can register it.');
					} else {
						elementNameInfo.val(parseError(data.errordetail));
					}
				}
				
			})
			.fail(function() {
				$("#output").val( "error" );
			});
	}	
	
	function doNowTime()
	{
		var date = new Date();
		$('#datetime').val(date.toLocaleDateString() + ' ' + date.toLocaleTimeString());
		$('#timestamp').val(date.getTime());
	}

	function sleep(ms) {
		ms += new Date().getTime();
		while (new Date() < ms){}
	} 

	function addCommas(str)
	{
		strbuf = str.toString();
		if( strbuf.indexOf('.') == -1)
		{
			return strbuf.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1,');
		}
		return strbuf.replace(/(\d)(?=(\d\d\d)+([^\d]))/g, '$1,');
	}

	function removeAllexceptDotAndNumbers (str)
	{
		return str.replace(/[^.0-9]/g,"");
	}
	
	function removeAllexceptNumbers(str)
	{
		return str.replace(/[^0-9]/g,"");
	}
	
	function getTextCursorPosition(ele) {   
		return ele.prop("selectionStart");
	}

	function setTextCursorPosition(ele, pos) {
		ele.prop("selectionStart", pos);
		ele.prop("selectionEnd", pos);
	}
	
	function parseError(error) 
	{
		try {
			var error = JSON.parse(error);
			message = error.message;
		} catch (e) {
			message = error;
		}
		return message;
	}

	function doProcess()
	{
		var txRaw = $("#txRaw").val();
		
		if(!txRaw) {
			return;
		}
		
		$('#output').html('Processing...');
		
		var nodeUrl = $("#nodeUrl").val();
		
		$.post( nodeUrl + "/index/api.html", { type: "post", apiurl: "/transactions/process", json: txRaw } )
			.done(function( data ) {
				
				if(data.type == 'apicallerror')	{
					$("#output").val(''+data.errordetail);
				}
				if(data.type == 'success')	{
					
					if(isNaN(data.result)){
						$("#output").val(''+data.result);
					} else {
						switch (data.result) {
							case "1":
								$("#output").val('VALIDATE_OK');
								break
							case "2":
								$("#output").val('INVALID_ADDRESS');
								break
							case "3":
								$("#output").val('NEGATIVE_AMOUNT');
								break
							case "4":
								$("#output").val('NEGATIVE_FEE');
								break
							case "5":
								$("#output").val('NO_BALANCE');
								break
							case "6":
								$("#output").val('INVALID_REFERENCE');
								break
							case "7":
								$("#output").val('INVALID_NAME_LENGTH');
								break
							case "8":
								$("#output").val('INVALID_VALUE_LENGTH');
								break
							case "9":
								$("#output").val('NAME_ALREADY_REGISTRED');
								break
							case "15":
								$("#output").val('INVALID_AMOUNT');
								break
							case "17":
								$("#output").val('NAME_NOT_LOWER_CASE');
								break
							case "27":
								$("#output").val('INVALID_DATA_LENGTH');
								break
							case "34":
								$("#output").val('INVALID_PAYMENTS_LENGTH');
								break
							case "40":
								$("#output").val('FEE_LESS_REQUIRED');
								break
							case "41":
								$("#output").val('INVALID_RAW_DATA');
								break
							case "1000":
								$("#output").val('NOT_YET_RELEASED');
								break
						}
					}
				}
			})
			.fail(function() {
				$("#output").val('error!');			
			});
	}
	
	function doLoadLastReference()
	{
		var base58SenderAccountAddress = $('#base58SenderAccountAddress').val();

		if(base58SenderAccountAddress == '') {
			$("#output").val('AccountAddress is null');
			return;
		}
		
		var nodeUrl = $("#nodeUrl").val();

		$('#base58LastReferenceOfAccount').val('...');
		$.post( nodeUrl + "/index/api.html", { type: "get", apiurl: "/addresses/lastreference/" + base58SenderAccountAddress + "/unconfirmed" } )
			.done(function( data ) {
				
				if(data.type == 'success'){
					var base58LastReferenceOfAccount = data.result;
					$('#base58LastReferenceOfAccount').val(base58LastReferenceOfAccount);
				}
				
				if(data.type == 'apicallerror'){
					$("#output").val(data.errordetail);
					$('#base58LastReferenceOfAccount').val('');
				}
				
			})
			.fail(function() {
				$("#output").val( "error" );
			});
	}
	
	if(false) {
		var ls1 = new Uint8Array();
		var byteArray = [0, 2, -1, 3, 0, 4, 0, 0];
		
		ls1 = appendBuffer(ls1, byteArray);
		
		var byteArray2 = [1, 2, 3, -30, 4, 0, 1];
		
		ls1 = appendBuffer(ls1, byteArray2);

		console.log(ls1);
		
		publicKey = Base58.decode("9NfJZz5pLxhiFT8GfELoTw99x6JxR3mUiQ9SBsrwNbcp");
		lastReference = Base58.decode("YWv9Gyi2xxEyEe6ztrGGuAPhmUD86s7h8CANQAcmsxdeS3pU5BvQKnbeyXjnXXd8HgLaDvYBBz6im3dDYTR817F");
		recipient = Base58.decode("QTz6fSV2VNc2wjwwsw57kwQzgQhmGw5idQ");
		var amount = parseFloat("123.12001");
		var fee = parseFloat("1.0");
		
		var time1 = new Date();

		for (var i = 0; i < 100000; i++) {
			var timestamp = 1455849866776 - Math.random()*100000000;
			buf = generatePaymentTransactionBase(publicKey, lastReference, recipient, amount, fee, timestamp);
		}
		
		console.log(buf);
		
		var time2 = new Date();

		console.log(time2.getTime() - time1.getTime());
		
		time1 = new Date();

		for (var i = 0; i < 100000; i++) {
			var timestamp = 1455849866776 - Math.random()*100000000;
			buf = generatePaymentTransactionBase2(publicKey, lastReference, recipient, amount, fee, timestamp);
		}
		
		console.log(buf);
		
		time2 = new Date();

		console.log(time2.getTime() - time1.getTime());
		
	}