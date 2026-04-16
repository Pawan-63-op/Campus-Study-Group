import React from 'react'
import FingerprintJS from '@fingerprintjs/fingerprintjs';

const getFinger = async () => {
  const fp = await FingerprintJS.load();
  const result = await fp.get();
  return { fingerPrint: result.visitorId };
};

export default getFinger
