import sgMail from '@sendgrid/mail'
import { NextApiRequest, NextApiResponse } from 'next';

sgMail.setApiKey(process.env.NEXT_PUBLIC_SENDGRID_APIKEY);

export default async (req = NextApiRequest, res = NextApiResponse) => {
  const { dashboard, email, name, product  } = req.body;
  
  // Log received data for debugging
  console.log('Received data:', req.body);

  const msg = {
    to: email,
    from: {
      email: 'aitropy.io@gmail.com',
      name: 'AITropy',
    },
    templateId: 'd-4f21379e3d3040f195b367850f8d2cbc',
    dynamic_template_data: {
      url: 'https://aitropy.io',
      support_email: 'aitropy.io@gmail.com',
      main_url: 'https://aitropy.io',
      dashboard,
      email,
      name,
      product,
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