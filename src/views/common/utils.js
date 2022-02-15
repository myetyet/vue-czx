import { Toast } from "vant";
import { md5 } from './md5';

const errorHandler = (err, msg, val = false) => {
  err.value = val;
  Toast({
    message: msg,
    position: 'bottom',
  });
};

const createUUID4 = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => (c.charCodeAt() === 120 ? (Math.random() * 16 | 0) : ((Math.random() * 16 | 0) & 0x3 | 0x8)).toString(16));

// Modified from https://github.com/blueimp/JavaScript-MD5
const MD5 = (msg) => md5(msg).toUpperCase();

export { errorHandler, createUUID4, MD5 };
