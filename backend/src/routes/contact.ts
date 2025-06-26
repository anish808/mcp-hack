import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'etalesystemsteam@gmail.com',
    pass: process.env.EMAIL_APP_PASSWORD || '', // Use app password for Gmail
  },
});

router.post('/contact', async (req, res) => {
  try {
    const { name, email, interest } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER || 'etalesystemsteam@gmail.com',
      to: 'etalesystemsteam@gmail.com',
      subject: 'New Contact Form Submission - Etale Systems',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; text-align: center;">New Contact Form Submission</h1>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-radius: 0 0 10px 10px;">
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #1e293b; margin-top: 0;">Contact Details</h2>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #475569;">Name:</strong>
                <span style="color: #64748b; margin-left: 10px;">${name}</span>
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #475569;">Email:</strong>
                <span style="color: #64748b; margin-left: 10px;">${email}</span>
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #475569;">Interest:</strong>
                <span style="color: #64748b; margin-left: 10px;">${interest || 'Not specified'}</span>
              </div>
              
              <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <p style="color: #64748b; font-size: 14px; margin: 0;">
                  Submitted at: ${new Date().toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      `,
      text: `
New Contact Form Submission

Name: ${name}
Email: ${email}
Interest: ${interest || 'Not specified'}

Submitted at: ${new Date().toLocaleString()}
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      success: true, 
      message: 'Thank you for your interest! We\'ll be in touch soon.' 
    });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      error: 'Failed to send email. Please try again later.' 
    });
  }
});

export default router; 