const
	bodyParser = require('body-parser'),
	cv = require('/usr/lib/node_modules/opencv4nodejs'),
	express = require('express'),	
	fs = require('fs'),
	os = require('os'),
	path = require('path'),
	rawParser = require('body-parser'),

	EXTENSIONS = [
		{extension: '.gif', mimetype: 'image/gif'},
		{extension: '.jpg', mimetype: 'image/jpeg'},
		{extension: '.png', mimetype: 'image/png'},
		{extension: '.tiff', mimetype: 'image/tiff'}
	],
	PORT = 1031,

	app = express(),
	classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2),
	tempDirPromise = fs.mkdtempSync(path.join(os.tmpdir(), 'face-detection-')),
	tempFileCounter = 1000;

app.use(bodyParser.raw());

console.log(process.version);
console.log(process.env);
console.log("starting");

app.put('', rawParser, (req, res) => {

	var tempFile;

	console.log("PUT / -- started");

	tempDirPromise
	.then((folder) => {

		var writeStream = fs.createWriteStream(tempFile),
			extension = null;

		for (let i = 0; i < EXTENSIONS.length; i++) {
			if (req.is(EXTENSIONS[i].mimetype)) {
				extension = EXTENSIONS[i].extension;
				break;
			}
		}
		if (null === extension) {
			return Promise.reject({
					code: 415,
					message: `Image type "${req.get('Content-Type')}" not recognized`});
		}

		tempFile = path.join(folder, 'image'+(++tempFileCounter)+extension);

		console.log("PUT / - tempFile ==", tempFile);

		writeStream.write(req.rawBody);
		return new Promise((resolve, reject) => {
			writeStream.end(() => {
				resolve();
			});
		});

	})
	.then(() => {

		var image = cv.imread(tempFile),
			detections = classifier.detectMultiScale(image.bgrtoGray());

		res.send(JSON.stringify(detections))

	})
	.catch((reason) => {

		res.statusCode = reason.statusCode;
		res.send(JSON.stringify(reason));

	})

	res.write('cv is' + (cv ? ' not' : ' ') + 'null');
	res.end();

});

console.log('cv is' + (cv ? ' not' : ' ') + 'null');

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
