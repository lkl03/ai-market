import sgMail from '@sendgrid/mail'
import { NextApiRequest, NextApiResponse } from 'next';

sgMail.setApiKey(process.env.NEXT_PUBLIC_SENDGRID_APIKEY);

export default async (req = NextApiRequest, res = NextApiResponse) => {
  const { email, name, product, price, buyer } = req.body;
  
  // Log received data for debugging
  console.log('Received data:', req.body);

  const msg = {
    to: email,
    from: {
      email: 'aitropy.io@gmail.com',
      name: 'AITropy',
    },
    templateId: 'd-6c5cc82207714dc7a32a3e46ba69e6a3',
    dynamic_template_data: {
      url: 'https://aitropy.io',
      support_email: 'aitropy.io@gmail.com',
      main_url: 'https://aitropy.io',
      email,
      name,
      product,
      price,
      buyer
    }
  };

  try {
    await sgMail.send(msg);
    res.json({ message: `Email has been sent` })
  } catch (error) {
    // Log the error and respond with more details
    console.error('Error sending email:', error);
    res.status(500).json({ error: `Error sending email: ${error.message}` })
  }
}