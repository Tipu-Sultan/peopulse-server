const { Storage } = require('@google-cloud/storage');
const dotenv = require('dotenv');
dotenv.config();

    const storage = new Storage({
        projectId: process.env.PROJECT_KEY_ID,
        credentials: {
            "type": process.env.GOOGLE_CLOUD_TYPE,
            "project_id": process.env.GOOGLE_CLOUD_PROJECT_ID,
            "private_key_id": process.env.GOOGLE_CLOUD_PRIVATE_KEY_ID,
            "private_key": process.env.GOOGLE_CLOUD_PRIVATE_KEY,
            "client_email": process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
            "client_id": process.env.GOOGLE_CLOUD_CLIENT_ID,
            "auth_uri": process.env.GOOGLE_CLOUD_AUTH_URI,
            "token_uri": process.env.GOOGLE_CLOUD_TOKEN_URI,
            "auth_provider_x509_cert_url": process.env.GOOGLE_CLOUD_AUTH_PROVIDER_X509_CERT_URL,
            "client_x509_cert_url": process.env.GOOGLE_CLOUD_CLIENT_X509_CERT_URL,
            "universe_domain": process.env.GOOGLE_CLOUD_UNIVERSE_DOMAIN,
        }
    })



module.exports ={
    storage,
}