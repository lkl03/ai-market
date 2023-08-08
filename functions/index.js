/* eslint-disable */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');
const cors = require('cors')({origin: true});
admin.initializeApp();

const CLIENT_ID_SANDBOX = functions.config().paypal.client_id_sandbox;
const APP_SECRET_SANDBOX = functions.config().paypal.secret_sandbox;
const CLIENT_ID_LIVE = functions.config().paypal.client_id_live;
const APP_SECRET_LIVE = functions.config().paypal.secret_live;
const baseURL_SANDBOX = "https://api-m.sandbox.paypal.com";
const baseURL_LIVE = "https://api-m.paypal.com";

async function generateAccessToken(isLiveEnv) {
    const CLIENT_ID = isLiveEnv ? CLIENT_ID_LIVE : CLIENT_ID_SANDBOX;
    const APP_SECRET = isLiveEnv ? APP_SECRET_LIVE : APP_SECRET_SANDBOX;
    const baseURL = isLiveEnv ? baseURL_LIVE : baseURL_SANDBOX;

    const auth = Buffer.from(CLIENT_ID + ":" + APP_SECRET).toString("base64");

    const response = await fetch(`${baseURL}/v1/oauth2/token`, {
        method: "POST",
        body: "grant_type=client_credentials",
        headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded"
        },
    });

    const data = await response.json();
    return data.access_token;
}

async function createOrder(amount, title, desc, emailAddress, merchantId, isLiveEnv) {
    const baseURL = isLiveEnv ? baseURL_LIVE : baseURL_SANDBOX;
    const accessToken = await generateAccessToken(isLiveEnv);

    const url = `${baseURL}/v2/checkout/orders`;
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            intent: "CAPTURE",
            purchase_units: [{
                    items: [{
                    "name": String(title),
                    "quantity": "1",
                    "description": String(desc),
                    "unit_amount": {
                        "currency_code": "USD",
                        "value": String(amount)
                    },
                    }],
                    amount: {
                        currency_code: "USD",
                        value: String(amount),
                        breakdown: {
                            item_total: {
                                currency_code: "USD",
                                value: String(amount)
                            }
                        }
                    },
                    payee: {
                        email_address: emailAddress,
                        merchant_id: merchantId
                    },
                }],
        }),
    });
    const data = await response.json();
    return data;
}

async function capturePayment(orderId, isLiveEnv) {
    const baseURL = isLiveEnv ? baseURL_LIVE : baseURL_SANDBOX;
    const accessToken = await generateAccessToken(isLiveEnv); 
    const url = `${baseURL}/v2/checkout/orders/${orderId}/capture`;
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
    });
    const data = await response.json();
    return data;
}

exports.createPayPalOrder = functions.https.onRequest(async (req, res) => {
    cors(req, res, async () => {
        try {
            const { amount, title, desc, emailAddress, merchantId, isLiveEnv } = req.body;
            const orderData = await createOrder(amount, title, desc, emailAddress, merchantId, isLiveEnv);
            res.status(200).send(orderData);
        } catch {
            res.status(500).send({ error: 'Something went wrong' });
        }
    });
});
  
exports.capturePayPalOrder = functions.https.onRequest(async (req, res) => {
    cors(req, res, async () => {
        try {
            const {orderId, isLiveEnv} = req.body;
            const captureData = await capturePayment(orderId, isLiveEnv);
            res.status(200).send(captureData);
        } catch {
            res.status(500).send({ error: 'Something went wrong' });
        }
    });
});

exports.getPayPalAccessToken = functions.https.onRequest(async (req, res) => {
    cors(req, res, async () => {
        try {
            const { code, isLiveEnv } = req.body;

            if (!code) {
                return res.status(400).send({ error: 'Missing authorization code' });
            }

            const CLIENT_ID = isLiveEnv ? CLIENT_ID_LIVE : CLIENT_ID_SANDBOX;
            const APP_SECRET = isLiveEnv ? APP_SECRET_LIVE : APP_SECRET_SANDBOX;
            const baseURL = isLiveEnv ? baseURL_LIVE : baseURL_SANDBOX;

            const auth = Buffer.from(CLIENT_ID + ":" + APP_SECRET).toString("base64");
            const params = new URLSearchParams();
            params.append('grant_type', 'authorization_code');
            params.append('code', code);

            const response = await fetch(`${baseURL}/v1/oauth2/token`, {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Accept-Language': 'en_US',
                    'Authorization': 'Basic ' + auth,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: params
            });

            if (!response.ok) {
                throw new Error('Failed to get access token');
            }

            const data = await response.json();
            res.status(200).send(data);
        } catch {
            res.status(500).send({ error: 'Something went wrong' });
        }
    });
});

exports.getPayPalUserInfo = functions.https.onRequest(async (req, res) => {
    cors(req, res, async () => {
        try {
            const { access_token, isLiveEnv } = req.body;

            if (!access_token) {
                return res.status(400).send({ error: 'Missing access token' });
            }

            const baseURL = isLiveEnv ? baseURL_LIVE : baseURL_SANDBOX;

            const response = await fetch(`${baseURL}/v1/identity/openidconnect/userinfo/?schema=openid`, {
                method: "GET",
                headers: {
                    'Accept': 'application/json',
                    'Accept-Language': 'en_US',
                    'Authorization': `Bearer ${access_token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to get user information');
            }

            const data = await response.json();
            res.status(200).send(data); // Sending the data back to the client
        } catch {
            res.status(500).send({ error: 'Something went wrong' });
        }
    });
});