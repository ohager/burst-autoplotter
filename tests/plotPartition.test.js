const create = require('../src/plotPartition');

test("Check Partitions (100 GiB,1000, 1)", () => {
	
	const partition = create(100, 1000, 1);
	
	expect(partition.totalNonces).toBe(409600);
	expect(partition.plots.length).toBe(1);
	expect(partition.plots[0].startNonce).toBe(1000);
	expect(partition.plots[0].nonces).toBe(409600);
	
});


test("Check Partitions (10 GiB,0, 3)", () => {
	
	const partition = create(10, 0, 3);
	
	
	expect(partition.totalNonces).toBe(40960);
	expect(partition.plots.length).toBe(3);
	expect(partition.plots[0].startNonce).toBe(0);
	expect(partition.plots[0].nonces).toBe(13648);
	expect(partition.plots[1].startNonce).toBe(13649);
	expect(partition.plots[1].nonces).toBe(13648);
	expect(partition.plots[2].startNonce).toBe(27298);
	expect(partition.plots[2].nonces).toBe(13664);
	
});


test("Check Partitions (2.73 GiB,0, 3)", () => {
	
	const partition = create(2.73, 0, 3);
	
	expect(partition.totalNonces).toBe(11176);
	expect(partition.plots.length).toBe(3);
	expect(partition.plots[0].startNonce).toBe(0);
	expect(partition.plots[0].nonces).toBe(3720);
	expect(partition.plots[1].startNonce).toBe(3721);
	expect(partition.plots[1].nonces).toBe(3720);
	expect(partition.plots[2].startNonce).toBe(7442);
	expect(partition.plots[2].nonces).toBe(3736);
	
});