import "server-only";
export function emailConfigured(){return Boolean(process.env.SMTP_HOST&&process.env.SMTP_USER&&process.env.SMTP_PASSWORD&&process.env.SMTP_FROM);}
export async function sendTransactionalEmail(input:{to:string;subject:string;text:string;html?:string}){if(!emailConfigured())return {sent:false,reason:"SMTP_NOT_CONFIGURED"}; if(/[\r\n]/.test(input.to)||/[\r\n]/.test(input.subject))throw new Error("Invalid email header"); return {sent:false,reason:"SMTP_PROVIDER_NOT_ENABLED"};}
