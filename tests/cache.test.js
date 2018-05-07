const fs = require('fs-extra');
const path = require('path');

const {load, update} = require('../src/cache');

const TestCache = path.join(__dirname, "./testcache");

afterEach(() => {
	fs.removeSync(TestCache);
});

test("Load Cache", () => {
	const {accountId, lastNonce, instructionSet, smtp, email} = load(TestCache);
	expect(accountId).toBe("1234567890123456789");
	expect(lastNonce).toBe(0);
	expect(instructionSet).toBe("SSE");
	
	// initial cache data
	expect(email).toEqual({
		enabled: false,
		address: 'yourmail@mailer.com'
	});
	
	const {host, port, secure, auth} = smtp;
	expect(host).toBe("smtp.mailtrap.io");
	expect(port).toBe(2525);
	expect(secure).toBe(true);
	expect(auth).toEqual({
		user: 'user',
		pass: 'password'
	});
});

test("Update Cache", () => {
	
	const testData = {
		notCacheable: "NotCacheable",
		accountId: "123456789",
		smtp: {
			host: "smtp.mailtrap.io",
			port: 100,
			secure: false,
			auth: {
				user: "user",
				pass: "password"
			}
		}
	};
	
	update(testData, TestCache);
	
	const cacheData = load(TestCache);
	
	expect(cacheData.notCacheable).not.toBeDefined();
	expect(cacheData.accountId).toBe("123456789");
	expect(cacheData.lastNonce).toBe(0);
	
	// from initial cache data
	expect(cacheData.email).toEqual({
		enabled: false,
		address: 'yourmail@mailer.com'
	});
	
	
	const {smtp} = cacheData;
	expect(smtp.port).toBe(100);
	expect(smtp.secure).toBe(false);
	
});
