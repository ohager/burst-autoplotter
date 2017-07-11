const {create} = require('../src/plotPartition');

test("Check Partitions (100 GiB,0, 3)", () => {
	
	const partition = create(100,0,3);
	
	expect(partition.totalNonces).toBe(409600);
	expect(partition.plots.length).toBe(3);
	expect(partition.plots[0].startNonce).toBe(0);
	expect(partition.plots[0].nonces).toBe(136533);
	expect(partition.plots[1].startNonce).toBe(136533);
	expect(partition.plots[1].nonces).toBe(136533);
	expect(partition.plots[2].startNonce).toBe(273066);
	expect(partition.plots[2].nonces).toBe(136534);
	
});

test("Check Partitions (100 GiB,1000, 1)", () => {
	
	const partition = create(100,1000,1);
	
	expect(partition.totalNonces).toBe(409600);
	expect(partition.plots.length).toBe(1);
	expect(partition.plots[0].startNonce).toBe(1000);
	expect(partition.plots[0].nonces).toBe(409600);
	
});