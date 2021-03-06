var ejs = require('ejs');
var fs = require('fs');
var watch = require('node-watch');

function getTemplateFolder(filePath)
{
	return filePath.split('templates/').join('');
}

function scanTemplates(basePath)
{
	var files = fs.readdirSync(basePath);

	files.forEach(function(file)
	{
		var filePath = [basePath, file].join('/');
		var stat = fs.statSync(filePath);

		if(stat.isDirectory())
		{
			try
			{
				fs.mkdirSync(getTemplateFolder(filePath));
			}
			catch(error){}

			scanTemplates(filePath);
		}
		else
		{
			if(file == 'index.ejs')
			{
				renderFile(filePath);
			}
			else if(file == 'model.json')
			{

			}
			else if(file.indexOf('.ejs') < 0)
			{
				fs.createReadStream(filePath)
					.pipe(fs.createWriteStream(getTemplateFolder(filePath)));
			}
		}

	});	
}

scanTemplates('templates');

console.log('!!! website genereation completed');

watch('templates', function(event, filename)
{
	console.log(event, filename);

	scanTemplates('templates');
});

function model(name)
{
	try
	{
		var data = fs.readFileSync(['templates', name, 'model.json'].join('/'), 'utf8');
		return JSON.parse(data);
	}
	catch(error){}
	return {};
}

function renderFile(filePath)
{
	var template = fs.readFileSync(filePath, 'utf8');
	var html = ejs.render(template, {model:model}, {filename:'temp'});

	var outputName = filePath.split('.ejs').join('.html');

	fs.writeFileSync(getTemplateFolder(outputName), html, 'utf8');

	console.log('>>> ' + filePath + ' has been rendered');
}