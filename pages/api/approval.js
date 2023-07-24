import sgMail from '@sendgrid/mail'
import { NextApiRequest, NextApiResponse } from 'next';

sgMail.setApiKey(process.env.NEXT_PUBLIC_SENDGRID_APIKEY);

export default async (req = NextApiRequest, res = NextApiResponse) => {
  const { email, name, product } = req.body;
  
  // Log received data for debugging
  console.log('Received data:', req.body);

  const msg = {
    to: email,
    from: {
      email: 'librecripto@gmail.com',
      name: 'LibreCripto',
    },
    templateId: 'd-2c24a4216e824340aa8ac85743078252',
    dynamic_template_data: {
      url: 'https://librecripto.com/acceder',
      support_email: 'librecripto@librecripto.com',
      main_url: 'https://librecripto.com',
      email,
      name,
      product
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