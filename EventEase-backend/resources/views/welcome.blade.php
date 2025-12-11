<!DOCTYPE html>
<html>
<head>
    <title>Welcome to SchoolEvents Admin Portal</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #eef2f7;
            color: #333;
            padding: 20px;
            border-radius: 8px;
        }
        .container {
            max-width: 600px;
            margin: auto;
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
        }
        h1 {
            color: #0056b3;
        }
        h2 {
            margin-top: 10px;
            color: #444;
        }
        p {
            line-height: 1.6;
        }
        .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #6c757d;
        }
        .button {
            background-color: #0056b3;
            color: white !important;
            padding: 10px 15px;
            text-decoration: none;
            border-radius: 5px;
            display: inline-block;
            margin-top: 10px;
        }
        .button:hover {
            background-color: #003d80;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to the Admin Dashboard!</h1>
        <h2>Hello, {{ $admin['first_name'] ?? 'Admin' }} {{ $admin['last_name'] ?? '' }}!</h2>
        <p>We're excited to have you as part of the administration team for our School Event Management System. As an admin, you have full access to manage event schedules, approve student registrations, coordinate with staff, and keep the community informed.</p>
        <p>To begin managing events, log in to your dashboard and explore the tools available to help you streamline event planning and execution.</p>
        <p>
            <a class="button" href="/admin">Go to Admin Dashboard</a>
        </p>
        <p>If you need assistance or have any questions about your admin tools, our support team is ready to help you anytime.</p>
        <div class="footer">
            <p>Thank you for your leadership,</p>
            <p>The SchoolEvents Team</p>
        </div>
    </div>
</body>
</html>
