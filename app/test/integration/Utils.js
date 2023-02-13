const waitUntilAsserted = async (
    func,
    maxTimeout,
    retryDelay,
) => {
    const now = new Date();
    while (true) {
        try {
            await func();
            return;
        } catch (e) {
            if (new Date().getTime() - now.getTime() > maxTimeout) {
                throw e;
            }
            await new Promise((r) => setTimeout(r, retryDelay));
        }
    }
};

module.exports = {waitUntilAsserted};