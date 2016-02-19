// QORA

function getKeyPairFromSeed(seed, returnBase58)
{
	if(typeof(seed) == "string") {
		seed = new Uint8Array(Base58.decode(seed));
	}
	
	var keyPair = nacl.sign.keyPair.fromSeed(seed);
	
	var base58privateKey = Base58.encode(keyPair.secretKey);
	var base58publicKey = Base58.encode(keyPair.publicKey);
	if(returnBase58) {
		return {
			privateKey: Base58.encode(keyPair.secretKey),
			publicKey: Base58.encode(keyPair.publicKey)
		};
	} else {
		return {
			privateKey: keyPair.secretKey,
			publicKey: keyPair.publicKey
		};
	}
}

function wordToBytes (word) {
	var bytes = [];
	for (var b = 0; b < 32; b += 8) {
		bytes.push((word >>> (24 - b % 32)) & 0xFF);
	}
	return bytes;
};

function int64ToBytes (int64) {
    // we want to represent the input as a 8-bytes array
    var byteArray = [0, 0, 0, 0, 0, 0, 0, 0];

    for ( var index = 0; index < byteArray.length; index ++ ) {
        var byte = int64 & 0xff;
        byteArray [ byteArray.length - index - 1 ] = byte;
        int64 = (int64 - byte) / 256 ;
    }

    return byteArray;
};



function generateAccountSeed(seed, nonce, returnBase58)
{
	if(typeof(seed) == "string") {
		seed = Base58.decode(seed);
	}
	
	nonceBytes = wordToBytes(nonce);
	
	var resultSeed = [];
	
	resultSeed = resultSeed.concat(nonceBytes);
	resultSeed = resultSeed.concat(Array.prototype.slice.call(seed));
	resultSeed = resultSeed.concat(nonceBytes);
	
	if(returnBase58) {
		return Base58.encode(new Uint8Array(SHA256.digest(SHA256.digest(resultSeed))));
	} else {
		return new Uint8Array(SHA256.digest(SHA256.digest(resultSeed)));
	}
	
}


function getAccountAddressFromPublicKey(publicKey)
{
	if(typeof(publicKey) == "string") {
		publicKey = new Uint8Array(Base58.decode(publicKey));
	}
	
	var publicKeyHashSHA256 = SHA256.digest(publicKey);

	var ripemd160 = new RIPEMD160();
	
	var publicKeyHash = ripemd160.digest(publicKeyHashSHA256);
	
	var addressArray = [];
	
	var ADDRESS_VERSION = 58;
	
	addressArray.push(ADDRESS_VERSION);
	
	addressArray = addressArray.concat(Array.prototype.slice.call(publicKeyHash));
	
	var checkSum = SHA256.digest(SHA256.digest(addressArray));

	addressArray.push(checkSum[0]);
	addressArray.push(checkSum[1]);
	addressArray.push(checkSum[2]);
	addressArray.push(checkSum[3]);
	
	return Base58.encode(new Uint8Array(addressArray));
}

function generateSignaturePaymentTransaction(keyPair, lastReference, recipient, amount, fee, timestamp)
{
	var PAYMENT_TRANSACTION = 2;
	
	data = [];
	typeBytes = wordToBytes(PAYMENT_TRANSACTION);
	data = data.concat(typeBytes);

	timestampBytes = int64ToBytes(timestamp);
	data = data.concat(timestampBytes);
	
	data = data.concat(Array.prototype.slice.call(lastReference));
	
	data = data.concat(Array.prototype.slice.call(keyPair.publicKey));

	data = data.concat(Array.prototype.slice.call(recipient));
	
	amountBytes = int64ToBytes(amount*100000000);
	data = data.concat(amountBytes);

	feeBytes = int64ToBytes(fee*100000000);
	data = data.concat(feeBytes);
	
	var signature = nacl.sign.detached(new Uint8Array(data), keyPair.privateKey);
    
	return signature;
}

function generatePaymentTransaction(keyPair, lastReference, recipient, amount, fee, timestamp, signature)
{
	var PAYMENT_TRANSACTION = 2;
	
	data = [];
	typeBytes = wordToBytes(PAYMENT_TRANSACTION);
	data = data.concat(typeBytes);

	timestampBytes = int64ToBytes(timestamp);
	data = data.concat(timestampBytes);
	
	data = data.concat(Array.prototype.slice.call(lastReference));
	
	data = data.concat(Array.prototype.slice.call(keyPair.publicKey));

	data = data.concat(Array.prototype.slice.call(recipient));
	
	amountBytes = int64ToBytes(amount*100000000);
	data = data.concat(amountBytes);

	feeBytes = int64ToBytes(fee*100000000);
	data = data.concat(feeBytes);
	
	data = data.concat(Array.prototype.slice.call(signature));
	
	//Signeddata =  Array.prototype.slice.call(new Int8Array(data));
	
	return data;
}














