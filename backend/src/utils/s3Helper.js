
const { S3Client, PutObjectCommand, CreateBucketCommand, waitUntilBucketExists } = require('@aws-sdk/client-s3');
const { createPdfStream } = require('../utils/PdfHelper');


const bucketName = "bucket-abelp-pdf-aramedic";
const s3Client = new S3Client({ region: "us-east-1" });



/**
 * 
 * @param {ReportData} reportData
 * @returns {Promise<void>} 
 */
async function saveReportToS3(reportData) {

    await createBucketIfNotExists();

    try {
        const passThroughStream = createPdfStream(reportData);
        const uuid = crypto.randomUUID();
        const fileName = `${reportData.id + '__' + uuid}.pdf`;

        let file = null;
        passThroughStream.on('data', (chunk) => {
            file = Buffer.concat([file || Buffer.alloc(0), chunk]);
        });

        passThroughStream.on('end', async () => {

            try {
                await s3Client.send(
                    new PutObjectCommand({
                        Bucket: bucketName,
                        Key: fileName,
                        Body: file,
                        ContentType: "application/pdf",
                    }),
                );
            } catch (error) {
                console.error("Error al subir el archivo a S3:", error);
            }
        });
    }catch (error) {
        console.error("Error al guardar el archivo a S3: ", error);
    }
    
}



async function createBucketIfNotExists() {
    try {
        const { Location } = await s3Client.send(
            new CreateBucketCommand({ Bucket: bucketName })
        );
        await waitUntilBucketExists({ client: s3Client }, { Bucket: bucketName });
        console.log(`Bucket ${bucketName} creado en ${Location}`);
    } catch (caught) {
        if (caught.name === "BucketAlreadyOwnedByYou" || caught.name === "BucketAlreadyExists") {
            console.log(`Bucket ${bucketName} ya existe`);
        } else {
            console.error("Error al crear el bucket:", caught);
        }
    }
}


module.exports = {
    saveReportToS3


}



/**
 * @typedef {Object} ReportData
 * @property {Number} id
 * @property {Number} emergencyId
 * @property {String} medicName
 * @property {String} patientName
 * @property {Date} date
 * @property {String} initialLocation
 * @property {String} notes
 * 
 * 
 */
