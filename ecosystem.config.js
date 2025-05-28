module.exports = {
    apps: [
        {
            name: 'portfolio-webhook',
            script: './webhook-server.js',
            env_file: './.env',
            error_file: './logs/error.log',
            out_file: './logs/out.log',
            log_file: './logs/combined.log',
            time: true
        }
    ]
};