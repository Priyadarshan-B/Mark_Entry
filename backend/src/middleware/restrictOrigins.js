const restrictOrigin = (req, res, next) => {
    const disallowedAgents = [
        "PostmanRuntime", "curl", "Insomnia", "HttpClient", "python-requests", 
        "wget", "Httpie", "Go-http-client", "RestSharp", "Node-fetch", 
        "Paw", "okhttp", "libwww-perl", "Jakarta", "PHP", "HttpClient", 
        "java", "ruby", "Lynx", "axios", "fetch",
    ];

    const userAgent = req.headers['user-agent'] || '';
    const lowerUserAgent = userAgent.toLowerCase();

    if (disallowedAgents.some(agent => lowerUserAgent.includes(agent.toLowerCase()))) {
        return res.status(403).json({ message: "Access denied: Unauthorized client detected" });
    }

    next();
};

module.exports = restrictOrigin;
