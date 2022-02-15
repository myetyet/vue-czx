import axios from 'axios';

export default function handle(req, res) {
  let url = req.body;
  if (typeof url !== 'string') {
    res.status(403).send(null);
    return;
  }
  const patterns = [
    /http:\/\/api.czjtkx.com\/CzBus\/V4\.1\/Bus\/GetList\?Line_Id=\d+&Line_Type=\d+/,
    /http:\/\/api.czjtkx.com\/CzBus\/V4\.1\/Station\/GetListByLine\?Line_Id=\d+&Line_Type=\d+/,
    /http:\/\/api.czjtkx.com\/CzBus\/V4\.1\/Line\/GetDayPlanTime\?Line_Id=\d+&Line_Type=\d+/,
    /http:\/\/api.czjtkx.com\/CzBus\/V4\.1\/Line\/GetList\?Line_Id=\d+&Line_Type=\d+/,
    /http:\/\/api.czjtkx.com\/CzBus\/V4\.1\/Line\/GetList\?Line_Name=.+/,
  ];
  let whitelist = false;
  for (const pattern of patterns) {
    if (pattern.test(url)) {
      whitelist = true;
      break;
    }
  }
  if (!whitelist) {
    res.status(403).send(null);
    return;
  }
  axios(url)
    .then((rsp) => res.status(200).send(rsp.data))
    .catch(() => res.status(500).send(null));
};
