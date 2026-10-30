import { JSDOM } from 'jsdom';
import { requestDouyinUrl } from '@48tools-api/toutiao/douyin';
import parser, { DouyinUrlType } from './parser';

jest.mock('@48tools-api/toutiao/douyin', (): { requestDouyinUrl: jest.Mock } => ({
  requestDouyinUrl: jest.fn()
}));

const requestDouyinUrlMock: jest.MockedFunction<typeof requestDouyinUrl> = requestDouyinUrl as jest.MockedFunction<typeof requestDouyinUrl>;

describe('test douyin url parser', function(): void {
  const dom: JSDOM = new JSDOM();
  const originalDOMParser: typeof DOMParser | undefined = globalThis.DOMParser;

  beforeAll(function(): void {
    globalThis.DOMParser = dom.window.DOMParser;
  });

  afterAll(function(): void {
    if (originalDOMParser) {
      globalThis.DOMParser = originalDOMParser;
    } else {
      Reflect.deleteProperty(globalThis, 'DOMParser');
    }
    dom.window.close();
  });

  beforeEach(function(): void {
    requestDouyinUrlMock.mockReset();
  });

  test('should parse a full user url with query parameters without a request', async function(): Promise<void> {
    await expect(parser(
      'https://www.douyin.com/user/MS4wLjABAAAA-user?from_ssr=1',
      undefined
    )).resolves.toEqual({ type: DouyinUrlType.User, id: 'MS4wLjABAAAA-user' });
    expect(requestDouyinUrlMock).not.toHaveBeenCalled();
  });

  test('should preserve numeric and non-numeric bare-id behavior', async function(): Promise<void> {
    await expect(parser('7184782545546939709', undefined)).resolves.toEqual({
      type: DouyinUrlType.Video,
      id: '7184782545546939709'
    });
    await expect(parser('MS4wLjABAAAA-user', undefined)).resolves.toEqual({
      type: DouyinUrlType.User,
      id: 'MS4wLjABAAAA-user'
    });
    expect(requestDouyinUrlMock).not.toHaveBeenCalled();
  });

  test('should keep modal_id priority over a user path', async function(): Promise<void> {
    await expect(parser(
      'https://www.douyin.com/user/MS4wLjABAAAA-user?modal_id=7184782545546939709',
      undefined
    )).resolves.toEqual({ type: DouyinUrlType.Video, id: '7184782545546939709' });
    expect(requestDouyinUrlMock).not.toHaveBeenCalled();
  });

  test('should parse a user from a short-link Location header', async function(): Promise<void> {
    requestDouyinUrlMock.mockResolvedValue({
      type: 'html',
      html: '',
      redirectUrl: 'https://www.douyin.com/user/MS4wLjABAAAA-user?from_ssr=1'
    });

    await expect(parser('https://v.douyin.com/user-share/', undefined)).resolves.toEqual({
      type: DouyinUrlType.User,
      id: 'MS4wLjABAAAA-user'
    });
  });

  test('should parse video and note ids from short-link Location headers', async function(): Promise<void> {
    requestDouyinUrlMock.mockResolvedValue({
      type: 'html',
      html: '',
      redirectUrl: 'https://www.douyin.com/video/7209139149230591247'
    });
    await expect(parser('https://v.douyin.com/video-share/', undefined)).resolves.toEqual({
      type: DouyinUrlType.Video,
      id: '7209139149230591247'
    });

    requestDouyinUrlMock.mockResolvedValue({
      type: 'html',
      html: '',
      redirectUrl: 'https://www.douyin.com/note/7160299412965657888'
    });
    await expect(parser('https://v.douyin.com/note-share/', undefined)).resolves.toEqual({
      type: DouyinUrlType.Video,
      id: '7160299412965657888'
    });
  });

  test('should retain the legacy iesdouyin share-page anchor parser', async function(): Promise<void> {
    requestDouyinUrlMock.mockResolvedValue({
      type: 'html',
      html: '<a href="https://www.iesdouyin.com/share/user/MS4wLjABAAAA-user?sec_uid=MS4wLjABAAAA-user">打开抖音</a>'
    });

    await expect(parser('https://v.douyin.com/legacy-user/', undefined)).resolves.toEqual({
      type: DouyinUrlType.User,
      id: 'MS4wLjABAAAA-user'
    });
  });

  test('should parse a supported canonical link from returned html', async function(): Promise<void> {
    requestDouyinUrlMock.mockResolvedValue({
      type: 'html',
      html: '<link rel="canonical" href="https://www.douyin.com/user/MS4wLjABAAAA-canonical">'
    });

    await expect(parser('https://v.douyin.com/canonical-user/', undefined)).resolves.toEqual({
      type: DouyinUrlType.User,
      id: 'MS4wLjABAAAA-canonical'
    });
  });

  test('should reject redirect targets outside supported douyin domains', async function(): Promise<void> {
    requestDouyinUrlMock.mockResolvedValue({
      type: 'html',
      html: '<a href="https://example.com/user/not-douyin">next</a>',
      redirectUrl: 'https://example.com/user/not-douyin'
    });

    await expect(parser('https://v.douyin.com/unknown-domain/', undefined)).resolves.toBeUndefined();
  });

  test.each([
    ['https://www.douyin.com/video/123', DouyinUrlType.Video, '123'],
    ['https://www.douyin.com/NOTE/123', DouyinUrlType.Video, '123'],
    ['https://www.iesdouyin.com/share/user/user-id', DouyinUrlType.User, 'user-id'],
    ['https://www.iesdouyin.com/share/video/123', DouyinUrlType.Video, '123'],
    ['https://www.iesdouyin.com/share/note/123', DouyinUrlType.Video, '123']
  ])('should parse the supported direct url %s', async function(url: string, type: string, id: string): Promise<void> {
    await expect(parser(url, undefined)).resolves.toEqual({ type, id });
    expect(requestDouyinUrlMock).not.toHaveBeenCalled();
  });

  test('should prefer Location over a different canonical and anchor', async function(): Promise<void> {
    requestDouyinUrlMock.mockResolvedValue({
      type: 'html',
      html: '<a href="https://www.douyin.com/user/anchor"></a><link rel="canonical" href="https://www.douyin.com/user/canonical">',
      redirectUrl: '//www.douyin.com/user/location'
    });

    await expect(parser('https://v.douyin.com/priority/', 'test-cookie=value')).resolves.toEqual({
      type: DouyinUrlType.User,
      id: 'location'
    });
    expect(requestDouyinUrlMock).toHaveBeenCalledWith('https://v.douyin.com/priority/', 'test-cookie=value');
  });

  test('should read Location when a nonce cookie is also returned', async function(): Promise<void> {
    requestDouyinUrlMock.mockResolvedValue({
      type: 'cookie',
      cookie: 'test-nonce',
      html: '',
      redirectUrl: 'https://www.iesdouyin.com/share/user/user-id'
    });

    await expect(parser('https://v.douyin.com/nonce/', undefined)).resolves.toEqual({
      type: DouyinUrlType.User,
      id: 'user-id'
    });
  });

  test('should decode HTML entities and prefer canonical over an earlier anchor', async function(): Promise<void> {
    requestDouyinUrlMock.mockResolvedValue({
      type: 'html',
      html: '<a href="https://www.douyin.com/user/anchor"></a>'
        + '<link href="https://www.douyin.com/user/canonical?from=share&amp;modal_id=123" rel="alternate canonical">'
    });

    await expect(parser('https://v.douyin.com/entity/', undefined)).resolves.toEqual({ type: DouyinUrlType.Video, id: '123' });
  });

  test('should ignore comments, data-href and unsupported anchors before a valid link', async function(): Promise<void> {
    requestDouyinUrlMock.mockResolvedValue({
      type: 'html',
      html: '<!-- <a href="https://www.douyin.com/user/comment"></a> -->'
        + '<a data-href="https://www.douyin.com/user/data">ignored</a>'
        + '<a href="https://example.com/user/external">ignored</a>'
        + '<a title=">" href="https://www.iesdouyin.com/share/user/actual">open</a>'
    });

    await expect(parser('https://v.douyin.com/anchors/', undefined)).resolves.toEqual({ type: DouyinUrlType.User, id: 'actual' });
  });

  test('should fall back to HTML for an invalid Location', async function(): Promise<void> {
    requestDouyinUrlMock.mockResolvedValue({
      type: 'html',
      html: '<a href="https://www.douyin.com/user/fallback">open</a>',
      redirectUrl: 'http://['
    });

    await expect(parser('https://v.douyin.com/fallback/', undefined)).resolves.toEqual({ type: DouyinUrlType.User, id: 'fallback' });
  });

  test.each([
    'https://www.douyin.com.example.com/user/fake',
    'https://notdouyin.com/user/fake',
    'https://www.douyin.com@example.com/user/fake',
    'https://v.douyin.com.example.com/share/',
    'https://example.com/?modal_id=123',
    'ftp://v.douyin.com/share/',
    'ftp://www.douyin.com/user/fake'
  ])('should reject unsupported input %s without a request', async function(url: string): Promise<void> {
    await expect(parser(url, undefined)).resolves.toBeUndefined();
    expect(requestDouyinUrlMock).not.toHaveBeenCalled();
  });

  test('should leave a verification page unresolved', async function(): Promise<void> {
    requestDouyinUrlMock.mockResolvedValue({ type: 'cookie', cookie: 'test-nonce', html: '<html>verification</html>' });

    await expect(parser('https://v.douyin.com/verification/', undefined)).resolves.toBeUndefined();
  });
});
