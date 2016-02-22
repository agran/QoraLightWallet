
	var nodeUrl = 'http://mirror.qora.co.in:9090';

	$(document).ready(function() {
		$("#menu").html(
		  '<a href="http://qora.co.in/light"><img height=107 width=93 src="qora.png"></a>'
		+ '<br><br><b>'
		+ '<a href=brainwallet.html>BrainWallet</a> | '
		+ '<a href=payment.html>Payment</a> | '
		+ '<a href=arbitrarytransaction.html>ArbitraryTransaction</a> | '
		+ '<a href=http://mirror.qora.co.in:9090/index/blockexplorer.html>BlockExplorer</a>'
		+ '</b><br><br>');
		
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
							case "15":
								$("#output").val('INVALID_AMOUNT');
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
		$.post( nodeUrl + "/index/api.html", { type: "get", apiurl: "/addresses/lastreference/" + base58SenderAccountAddress } )
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
	
	function toUTF8Array(str) {
		var utf8 = [];
		for (var i=0; i < str.length; i++) {
			var charcode = str.charCodeAt(i);
			if (charcode < 0x80) utf8.push(charcode);
			else if (charcode < 0x800) {
				utf8.push(0xc0 | (charcode >> 6), 
						  0x80 | (charcode & 0x3f));
			}
			else if (charcode < 0xd800 || charcode >= 0xe000) {
				utf8.push(0xe0 | (charcode >> 12), 
						  0x80 | ((charcode>>6) & 0x3f), 
						  0x80 | (charcode & 0x3f));
			}
			// surrogate pair
			else {
				i++;
				// UTF-16 encodes 0x10000-0x10FFFF by
				// subtracting 0x10000 and splitting the
				// 20 bits of 0x0-0xFFFFF into two halves
				charcode = 0x10000 + (((charcode & 0x3ff)<<10)
						  | (str.charCodeAt(i) & 0x3ff))
				utf8.push(0xf0 | (charcode >>18), 
						  0x80 | ((charcode>>12) & 0x3f), 
						  0x80 | ((charcode>>6) & 0x3f), 
						  0x80 | (charcode & 0x3f));
			}
		}
		return utf8;
	}
