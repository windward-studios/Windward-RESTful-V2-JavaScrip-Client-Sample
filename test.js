import pkg from 'windwardrestapi';
const {WindwardClient, Template, Xml_10DataSource, OutputFormatEnum} = pkg;


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};

async function main()
{
    //Create a new instance of the client
    let client = new WindwardClient.WindwardClient("http://localhost:64228/");
    
    //Get the verrsion information
    let version = await client.getVersionInfo();
    console.log("VERSION INFO:\n", version);

    //The datasource document I am sending to the engine to be processed
    const dsFilePath = './files/Manufacturing.xml';

    //Create new Xml_10DataSource object and pass in the datasource name, and the data file path.
    let testXmlDS = new Xml_10DataSource('InvestmentFactSheet', undefined, dsFilePath, undefined);
    console.log("DS:\n", testXmlDS);

    //The template file I wish to process.
    const filePath = './files/Manufacturing.docx';

    //Create a new template object (to see all the input params check the read me)
    let testTemplate = new Template(OutputFormatEnum.DOCX, [testXmlDS],undefined, filePath,
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined, undefined, undefined, undefined, undefined);
    console.log("FINAL TEMPLATE OBJECT: ", testTemplate);
    
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
    console.log('FINAL DOCUMENT OBJECT: \n', testGetDocument);

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
    console.log("METRICS: \n", testGetMetrics);

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
    console.log("FINAL TAGTREE: \n", testGetTagTree);

    //Delete the processed document
    let testDeleteDocument = await client.deleteDocument(testPostDocument.Guid);
    console.log("DOCUMENT DELETED CODE: ", testDeleteDocument, '\n');
    //Delete the processed metrics
    let testDeleteMetrics = await client.deleteMetrics(testPostMetrics.Guid);
    console.log("METRICS DELETED CODE: ", testDeleteMetrics, '\n');
    //Delete the processed tag tree.
    let testDeleteTagTree = await client.deleteTagTree(testPostTagTree.Guid);
    console.log("TAGTREE DELETED CODE: ", testDeleteTagTree, '\n');
}
main();