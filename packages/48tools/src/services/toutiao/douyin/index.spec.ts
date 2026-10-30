// @ts-expect-error
import got from 'got';
import { requestDouyinUrl } from './index';
import parser, { DouyinUrlType } from '../../../pages/Toutiao/Douyin/utils/parser';

jest.mock('got', (): unknown => ({ __esModule: true, default: { get: jest.fn() } }));
jest.mock('../../../utils/utils', (): unknown => ({ pcUserAgent: 'test-user-agent' }));
jest.mock('../../../utils/toutiao/signUtils', (): unknown => ({}));
jest.mock('../../../utils/toutiao/DouyinCookieStore', (): unknown => ({}));
jest.mock('../../../pages/Toutiao/sdk/AB', (): unknown => ({}));

const gotGetMock: jest.Mock = got.get as jest.Mock;

describe('test douyin short-link response', function(): void {
  beforeEach(function(): void {
    gotGetMock.mockReset();
  });

  test('should preserve Location without following the redirect', async function(): Promise<void> {
    const redirectUrl: string = 'https://www.douyin.com/user/user-id';

    gotGetMock.mockResolvedValue({ body: '', headers: { location: redirectUrl } });

    await expect(requestDouyinUrl('https://v.douyin.com/share/', 'test=value')).resolves.toEqual({
      type: 'html', html: '', redirectUrl
    });
    expect(gotGetMock).toHaveBeenCalledWith('https://v.douyin.com/share/', expect.objectContaining({
      followRedirect: false,
      headers: expect.objectContaining({ Cookie: '__ac_referer=__ac_blank;test=value' })
    }));
  });

  test('should preserve Location alongside an existing nonce cookie', async function(): Promise<void> {
    const redirectUrl: string = 'https://www.iesdouyin.com/share/user/user-id';

    gotGetMock.mockResolvedValue({ body: '', headers: {
      location: redirectUrl,
      'set-cookie': ['__ac_nonce=test-nonce; Path=/']
    } });

    await expect(requestDouyinUrl('https://v.douyin.com/share/')).resolves.toEqual({
      type: 'cookie', cookie: 'test-nonce', html: '', redirectUrl
    });
  });

  test('should retain the response shape when there is no Location', async function(): Promise<void> {
    gotGetMock.mockResolvedValue({ body: '<html>verification</html>', headers: {} });

    await expect(requestDouyinUrl('https://v.douyin.com/share/')).resolves.toEqual({
      type: 'html', html: '<html>verification</html>'
    });
  });

  test('should pass a raw HTTP Location through the service to the parser', async function(): Promise<void> {
    gotGetMock.mockResolvedValue({ body: '', headers: { location: 'https://www.douyin.com/user/user-id' } });

    await expect(parser('https://v.douyin.com/share/', undefined)).resolves.toEqual({ type: DouyinUrlType.User, id: 'user-id' });
  });
});
