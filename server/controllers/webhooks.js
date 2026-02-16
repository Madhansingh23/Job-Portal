import { Webhook } from "svix";
import User from "../models/User.js";

// API Controller Function to Manage Clerk User with database
export const clerkWebhooks = async (req, res) => {
    try {
        // Create a Svix instance with clerk webhook secret (if provided).
        const whookSecret = process.env.CLERK_WEBHOOK_SECRET
        if (whookSecret) {
            const whook = new Webhook(whookSecret)
            try {
                await whook.verify(JSON.stringify(req.body), {
                    "svix-id": req.headers["svix-id"],
                    "svix-timestamp": req.headers["svix-timestamp"],
                    "svix-signature": req.headers["svix-signature"]
                })
            } catch (verifyErr) {
                console.error('Svix verification failed:', verifyErr.message)
                return res.status(400).json({ success: false, message: 'Invalid webhook signature' })
            }
        } else {
            console.warn('CLERK_WEBHOOK_SECRET not set — webhook verification skipped (development)')
        }

        // Getting Data from request body
        const { data, type } = req.body

        // Switch Cases for differernt Events
        switch (type) {
            case 'user.created': {

                const userData = {
                    _id: data.id,
                    email: data.email_addresses[0].email_address,
                    name: data.first_name + " " + data.last_name,
                    image: data.image_url,
                    resume: ''
                }
                await User.create(userData)
                res.json({})
                break;
            }

            case 'user.updated': {
                const userData = {
                    email: data.email_addresses[0].email_address,
                    name: data.first_name + " " + data.last_name,
                    image: data.image_url,
                }
                await User.findByIdAndUpdate(data.id, userData)
                res.json({})
                break;
            }

            case 'user.deleted': {
                await User.findByIdAndDelete(data.id)
                res.json({})
                break;
            }
            default:
                break;
        }

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}