import { defHttp } from '/@/utils/http/axios';

enum Api {
  DoTrain = '/tbridge/train/',
  EstablishConnection = '/tbridge/esws/',
  Run = '/tbridge/run/',
  Test = '/tbridge/t/',
}

export function RunTask(params) {
  return defHttp.post({ url: Api.Test, params });
}
