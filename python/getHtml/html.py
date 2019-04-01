# -*- coding:utf-8 -*-

import urllib.request
import sys

#get请求
response = urllib.request.urlopen(sys.argv[1])
print(response.read().decode("utf-8"))