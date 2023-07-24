/* eslint-disable */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');
const cors = require('cors')({origin: true});
admin.initializeApp();

const CLIENT_ID = "AX9yFyALJu9l0nWJuw4_Qmfyo6ACVapt3WW15X2z9rczlkeuj3vHhURPy-UuIhPndEa6KG6d6mQpp9bG"
const APP_SECRET = "ENd6j7nUm1aWu_utS5-wr4qHMqp8rNcAzG7jTR1h0f6iBf4be7Ce7tbnvR79K3jigzOo7TnEvbD6Ojx5"
const baseURL = "https://api-m.sandbox.paypal.com";

async function generateAccessToken() {
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

async function createOrder(amount, title, desc, emailAddress, merchantId) {
    const accessToken = await generateAccessToken();
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

async function capturePayment(orderId) {
    const accessToken = await generateAccessToken();
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
            const { amount, title, desc, emailAddress, merchantId } = req.body;
            const orderData = await createOrder(amount, title, desc, emailAddress, merchantId);
            res.status(200).send(orderData);
        } catch {
            res.status(500).send({ error: 'Something went wrong' });
        }
    });
});
  
exports.capturePayPalOrder = functions.https.onRequest(async (req, res) => {
    cors(req, res, async () => {
        try {
            const orderId = req.body.orderId;
            const captureData = await capturePayment(orderId);
            res.status(200).send(captureData);
        } catch {
            res.status(500).send({ error: 'Something went wrong' });
        }
    });
});

exports.getPayPalAccessToken = functions.https.onRequest(async (req, res) => {
    cors(req, res, async () => {
        try {
            const { code } = req.body;

            if (!code) {
                return res.status(400).send({ error: 'Missing authorization code' });
            }

            const auth = Buffer.from(CLIENT_ID + ":" + APP_SECRET).toString("base64");
            const params = new URLSearchParams();
            params.append('grant_type', 'authorization_code');
            params.append('code', code);

            const response = await fetch(`https://api-m.sandbox.paypal.com/v1/oauth2/token`, {
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
            const { access_token } = req.body;

            if (!access_token) {
                return res.status(400).send({ error: 'Missing access token' });
            }

            const response = await fetch(`https://api-m.sandbox.paypal.com/v1/identity/openidconnect/userinfo/?schema=openid`, {
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