const path = require('path');
const template = require('../../src/notification/template');

const TestTemplate = path.join(__dirname, "./testtemplate.html");

test("Render Template File", () => {
	
	const rendered = template.render(TestTemplate, { foo: 'FOO', title : 'TITLE'});
	
	const expected = "<html lang=\"en\">\n" +
		"<head><title>TITLE</title></head>\n" +
		"<body><p>FOO</p></body>\n" +
		"</html>";
	
	expect(rendered.replace(/\s/g,"")).toBe(expected.replace(/\s/g,""));
});
