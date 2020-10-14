import pkg from 'windwardrestapi';
import fs from "fs";
const {WindwardClient, Template, Xml_10DataSource, OutputFormatEnum} = pkg;


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};

async function main()
{
    //Create a new instance of the client
    let client = new WindwardClient.WindwardClient("http://ec2-54-88-67-209.compute-1.amazonaws.com/");
    
    //Get the verrsion information
    let version = await client.getVersionInfo();
    console.log("VERSION INFO:\n", version);

    //The datasource document I am sending to the engine to be processed
    const dsFilePath = './files/Manufacturing.xml';

    //Create new Xml_10DataSource object and pass in the datasource name, and the data file path.
    let testXmlDS = new Xml_10DataSource('MANF_DATA_2009', undefined, dsFilePath, undefined);
 
    //The template file I wish to process.
    const filePath = './files/Manufacturing.docx';

    //Create a new template object (to see all the input params check the read me)
    let testTemplate = new Template(OutputFormatEnum.DOCX, [testXmlDS],undefined, filePath,
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined, undefined, undefined, undefined, undefined);
    
    //Post document to the engine for processing
    let testPostDocument = await client.postDocument(testTemplate);
    
    //check postDocument status and wait if not ready.
    while(true) {
        let status = await client.getDocumentStatus(testPostDocument.Guid);
        if (status != 302)
        {
            console.log("DOCUMENT NOT READY: ", status)
            await sleep(1000);
        }
        else
        {
            console.log("DOCUMENT READY: ", status)
            break;
        }

    }
    //get the processed template 
    let testGetDocument  = await client.getDocument(testPostDocument.Guid);

    //post the template metrics for processing. Pass in the template object.
    let testPostMetrics = await client.postMetrics(testTemplate);
    //check postMetrics status and wait if not ready
    while(true)
    {
        let status = await client.getMetricsStatus(testPostMetrics.Guid);
        if (status != 302)
        {
            console.log("METRICS NOT READY: ", status)
            await sleep(1000);
        }
        else
        {
            console.log("METRICS READY ", status)
            break;
        }
    }
    //Get the processed template metrics
    let testGetMetrics = await client.getMetrics(testPostMetrics.Guid);

    //Post the template tagtree for processing. Takes in template object.
    let testPostTagTree = await client.postTagTree(testTemplate);
    //check postTagtree status and wait if not ready
    while(true)
    {
        let status = await client.getTagTreeStatus(testPostTagTree.Guid);
        if (status != 302)
        {
            console.log("TAGTREE NOT READY: ", status);
            await sleep(1000);
        }
        else
        {
            console.log("TAGTREE READY: ", status);
            break;
        }

    }
    //Get the processed template tag tree.
    let testGetTagTree = await client.getTagTree(testPostTagTree.Guid);

    fs.writeFile("./files/output.docx", new Buffer.from(testGetDocument.Data, "base64"), function(err){});
    console.log("Wrote output to -> ./files/output.docx\n");
    //Delete the processed document
    let testDeleteDocument = await client.deleteDocument(testGetDocument.Guid);
    console.log("DOCUMENT DELETED CODE: ", testDeleteDocument, '\n');
    //Delete the processed metrics
    let testDeleteMetrics = await client.deleteMetrics(testGetMetrics.Guid);
    console.log("METRICS DELETED CODE: ", testDeleteMetrics, '\n');
    //Delete the processed tag tree.
    let testDeleteTagTree = await client.deleteTagTree(testGetTagTree.Guid);
    console.log("TAGTREE DELETED CODE: ", testDeleteTagTree, '\n');
}
main();