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

function int32ToBytes (word) {
	var byteArray = [];
	for (var b = 0; b < 32; b += 8) {
		byteArray.push((word >>> (24 - b % 32)) & 0xFF);
	}
	return byteArray;
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
	
	nonceBytes = int32ToBytes(nonce);
	
	var resultSeed = new Uint8Array();
	
	resultSeed = appendBuffer(resultSeed, nonceBytes);
	resultSeed = appendBuffer(resultSeed, seed);
	resultSeed = appendBuffer(resultSeed, nonceBytes);
	
	if(returnBase58) {
		return Base58.encode(SHA256.digest(SHA256.digest(resultSeed)));
	} else {
		return new SHA256.digest(SHA256.digest(resultSeed));
	}
	
}

function getAccountAddressFromPublicKey(publicKey)
{
	var ADDRESS_VERSION = 58;  // Q
	
	if(typeof(publicKey) == "string") {
		publicKey = Base58.decode(publicKey);
	}
	
	var publicKeyHashSHA256 = SHA256.digest(publicKey);

	var ripemd160 = new RIPEMD160();
	
	var publicKeyHash = ripemd160.digest(publicKeyHashSHA256);
	
	var addressArray = new Uint8Array();

	addressArray = appendBuffer(addressArray, [ADDRESS_VERSION]);
	addressArray = appendBuffer(addressArray, publicKeyHash);

	var checkSum = SHA256.digest(SHA256.digest(addressArray));

	addressArray = appendBuffer(addressArray, checkSum.subarray(0,4));

	return Base58.encode(addressArray);
}

function generateSignaturePaymentTransaction(keyPair, lastReference, recipient, amount, fee, timestamp) {
	const data = generatePaymentTransactionBase(keyPair.publicKey, lastReference, recipient, amount, fee, timestamp);
	return nacl.sign.detached(data, keyPair.privateKey);
}

function generatePaymentTransaction(keyPair, lastReference, recipient, amount, fee, timestamp, signature) {
	return appendBuffer(generatePaymentTransactionBase(keyPair.publicKey, lastReference, recipient, amount, fee, timestamp),
		signature);
}

function generatePaymentTransactionBase(publicKey, lastReference, recipient, amount, fee, timestamp) {
	const txType = TYPES.PAYMENT_TRANSACTION;
	const typeBytes = int32ToBytes(txType);
	const timestampBytes = int64ToBytes(timestamp);
	const amountBytes = int64ToBytes(amount * 100000000);
	const feeBytes = int64ToBytes(fee * 100000000);

	var data = new Uint8Array();
	
	data = appendBuffer(data, typeBytes);
	data = appendBuffer(data, timestampBytes);
	data = appendBuffer(data, lastReference);
	data = appendBuffer(data, publicKey);
	data = appendBuffer(data, recipient);
	data = appendBuffer(data, amountBytes);
	data = appendBuffer(data, feeBytes);

	return data;
}

function generateSignatureArbitraryTransactionV3(keyPair, lastReference, service, arbitraryData, fee, timestamp) {
	const data = generateArbitraryTransactionV3Base(keyPair.publicKey, lastReference, service, arbitraryData, fee, timestamp);
	return nacl.sign.detached(data, keyPair.privateKey);
}

function generateArbitraryTransactionV3(keyPair, lastReference, service, arbitraryData, fee, timestamp, signature) {
	return appendBuffer(generateArbitraryTransactionV3Base(keyPair.publicKey, lastReference, service, arbitraryData, fee, timestamp), 
		signature);
}

function generateArbitraryTransactionV3Base(publicKey, lastReference, service, arbitraryData, fee, timestamp) {
	const txType = TYPES.ARBITRARY_TRANSACTION;
	const typeBytes = int32ToBytes(txType);
	const timestampBytes = int64ToBytes(timestamp);
	const feeBytes = int64ToBytes(fee * 100000000);
	const serviceBytes = int32ToBytes(service);
	const dataSizeBytes = int32ToBytes(arbitraryData.length);
	const paymentsLengthBytes = int32ToBytes(0);  // Support payments - not yet.
	
	var data = new Uint8Array();

	data = appendBuffer(data, typeBytes);
	data = appendBuffer(data, timestampBytes);
	data = appendBuffer(data, lastReference);
	data = appendBuffer(data, publicKey);
	data = appendBuffer(data, paymentsLengthBytes);
	// Here it is necessary to insert the payments, if there are
	data = appendBuffer(data, serviceBytes);
	data = appendBuffer(data, dataSizeBytes);
	data = appendBuffer(data, arbitraryData);
	data = appendBuffer(data, feeBytes);
	
	return data;
}


function generateSignatureRegisterNameTransaction(keyPair, lastReference, owner, name, value, fee, timestamp) {
	const data = generateRegisterNameTransactionBase(keyPair.publicKey, lastReference, owner, name, value, fee, timestamp);
	return nacl.sign.detached(data, keyPair.privateKey);
}

function generateRegisterNameTransaction(keyPair, lastReference, owner, name, value, fee, timestamp, signature) {
	return appendBuffer( generateRegisterNameTransactionBase(keyPair.publicKey, lastReference, owner, name, value, fee, timestamp),	
		signature );
}

function generateRegisterNameTransactionBase(publicKey, lastReference, owner, name, value, fee, timestamp) {
	const txType = TYPES.REGISTER_NAME_TRANSACTION;
	const typeBytes = int32ToBytes(txType);
	const timestampBytes = int64ToBytes(timestamp);
	const feeBytes = int64ToBytes(fee * 100000000);
	const nameSizeBytes = int32ToBytes(name.length);
	const valueSizeBytes = int32ToBytes(value.length);

	var data = new Uint8Array();
	
	data = appendBuffer(data, typeBytes);
	data = appendBuffer(data, timestampBytes);
	data = appendBuffer(data, lastReference);
	data = appendBuffer(data, publicKey);
	data = appendBuffer(data, owner);
	data = appendBuffer(data, nameSizeBytes);
	data = appendBuffer(data, name);
	data = appendBuffer(data, valueSizeBytes);
	data = appendBuffer(data, value);
	data = appendBuffer(data, feeBytes);

	return data;
}












