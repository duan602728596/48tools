import * as process from 'node:process';

/**
 * This is a global variable that is used to disable the rejection of unauthorized certificates.
 *
 * You can see the details of the error: https://github.com/duan602728596/48tools/issues/31#issuecomment-2081338975
 *
 * Solutions can be found in: https://stackoverflow.com/questions/31673587/error-unable-to-verify-the-first-certificate-in-nodejs
 *
 * If you use got to make requests, you can set the option { rejectUnauthorized: false } to disable the rejection
 * of unauthorized certificates: https://stackoverflow.com/questions/31673587/error-unable-to-verify-the-first-certificate-in-nodejs
 */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';