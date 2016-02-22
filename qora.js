// QORA

const TYPES = {
	GENESIS_TRANSACTION: 1,
	PAYMENT_TRANSACTION: 2,
	
	REGISTER_NAME_TRANSACTION: 3,
	UPDATE_NAME_TRANSACTION: 4,
	SELL_NAME_TRANSACTION: 5,
	CANCEL_SELL_NAME_TRANSACTION: 6,
	BUY_NAME_TRANSACTION: 7,
	
	CREATE_POLL_TRANSACTION: 8,
	VOTE_ON_POLL_TRANSACTION: 9,
	
	ARBITRARY_TRANSACTION: 10,
	
	ISSUE_ASSET_TRANSACTION: 11,
	TRANSFER_ASSET_TRANSACTION: 12,
	CREATE_ORDER_TRANSACTION: 13,
	CANCEL_ORDER_TRANSACTION: 14,
	MULTI_PAYMENT_TRANSACTION: 15,

	DEPLOY_AT_TRANSACTION: 16,
	
	MESSAGE_TRANSACTION: 17
};

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

function generateSignaturePaymentTransaction(keyPair, lastReference, recipient, amount, fee, timestamp) {
	const data = generatePaymentTransactionBase(keyPair.publicKey, lastReference, recipient, amount, fee, timestamp);
	return nacl.sign.detached(new Uint8Array(data), keyPair.privateKey);
}

function generatePaymentTransaction(keyPair, lastReference, recipient, amount, fee, timestamp, signature) {
	return generatePaymentTransactionBase(keyPair.publicKey, lastReference, recipient, amount, fee, timestamp)
		.concat(Array.prototype.slice.call(signature));
}

function generatePaymentTransactionBase(publicKey, lastReference, recipient, amount, fee, timestamp) {
	var data = [];
	const txType = TYPES.PAYMENT_TRANSACTION;
	const typeBytes = wordToBytes(txType);
	const timestampBytes = int64ToBytes(timestamp);
	const amountBytes = int64ToBytes(amount * 100000000);
	const feeBytes = int64ToBytes(fee * 100000000);

	return data
		.concat(typeBytes)
		.concat(timestampBytes)
		.concat(Array.prototype.slice.call(lastReference))
		.concat(Array.prototype.slice.call(publicKey))
		.concat(Array.prototype.slice.call(recipient))
		.concat(amountBytes)
		.concat(feeBytes);
}

function generateSignatureArbitraryTransactionV3(keyPair, lastReference, service, arbitraryData, fee, timestamp) {
	const data = generateArbitraryTransactionV3Base(keyPair.publicKey, lastReference, service, arbitraryData, fee, timestamp);
	return nacl.sign.detached(new Uint8Array(data), keyPair.privateKey);
}

function generateArbitraryTransactionV3(keyPair, lastReference, service, arbitraryData, fee, timestamp, signature) {
	return generateArbitraryTransactionV3Base(keyPair.publicKey, lastReference, service, arbitraryData, fee, timestamp)
		.concat(Array.prototype.slice.call(signature));
}

function generateArbitraryTransactionV3Base(publicKey, lastReference, service, arbitraryData, fee, timestamp) {
	var data = [];
	const txType = TYPES.ARBITRARY_TRANSACTION;
	const typeBytes = wordToBytes(txType);
	const timestampBytes = int64ToBytes(timestamp);
	const feeBytes = int64ToBytes(fee * 100000000);
	const serviceBytes = wordToBytes(service);
	const dataSizeBytes = wordToBytes(arbitraryData.length);
	const paymentsLengthBytes = wordToBytes(0);  // Support payments - not yet.
	
	return data
		.concat(typeBytes)
		.concat(timestampBytes)
		.concat(Array.prototype.slice.call(lastReference))
		.concat(Array.prototype.slice.call(publicKey))
		.concat(paymentsLengthBytes)
		// Here it is necessary to insert the payments, if there are
		.concat(serviceBytes)
		.concat(dataSizeBytes)
		.concat(Array.prototype.slice.call(arbitraryData))
		.concat(feeBytes);
}
















