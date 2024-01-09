const cidParser = (url) => {
    const prefix = "https://ipfs.filebase.io/ipfs/";

    if (url.startsWith(prefix)) {
        return url.slice(prefix.length);
    } else {
        return url;
    }
};

module.exports = {
    cidParser,
}