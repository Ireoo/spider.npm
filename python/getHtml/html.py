# -*- coding: utf-8 -*-

import io
import sys
import zlib
import chardet

from urllib import request, parse

sys.stdout = io.TextIOWrapper(
    sys.stdout.buffer, encoding='utf8')  # 改变标准输出的默认编码

url = '%s' % sys.argv[1]
# dict = {
#     'name': 'Germey'
# }
# data = bytes(parse.urlencode(dict), encoding='utf8')
req = request.Request(url=url, method='GET')
req.add_header('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36')
req.add_header('Accept-encoding', 'gzip')  # 默认以gzip压缩的方式得到网页内容
with request.urlopen(req) as r:
    html = r.read()
    try:
        html = zlib.decompress(html, 16+zlib.MAX_WBITS)  # 解压网页
    except BaseException:
        print("")
    encode = chardet.detect(html)

    # sys.stdout = io.TextIOWrapper(
    #     sys.stdout.buffer, encoding='gb18030')  # 改变标准输出的默认编码
    # try:
    #     if 2 in sys.argv & sys.argv[2] == 'encoding':
    #         print(encode['encoding'])  # 输出chardet读取的信息
    #     else:
    print(html.decode(encode['encoding'], errors="replace"))
    # except NameError:
    #     print(html.decode(encode['encoding'], errors="replace"))
