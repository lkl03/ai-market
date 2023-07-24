import sgMail from '@sendgrid/mail'
import { NextApiRequest, NextApiResponse } from 'next';

sgMail.setApiKey(process.env.NEXT_PUBLIC_SENDGRID_APIKEY);

export default async (req = NextApiRequest, res = NextApiResponse) => {
  const { email, name } = req.body;
  
  // Log received data for debugging
  console.log('Received data:', req.body);

  const msg = {
    to: email,
    from: {
      email: 'librecripto@gmail.com',
      name: 'LibreCripto',
    },
    templateId: 'd-868c93e9484446659c627525e7f0cf8d',
    dynamic_template_data: {
      url: 'https://librecripto.com/acceder',
      support_email: 'librecripto@librecripto.com',
      main_url: 'https://librecripto.com',
      email,
      name
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