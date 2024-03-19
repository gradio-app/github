export const runtime_prerequisites_in = [
	"runtime-prerequisites.in",
	`pip-with-requires-python`,
];
export const runtime_prerequisites_txt = [
	"runtime-prerequisites.txt",
	`pip-with-requires-python==1.0.1

# The following packages are considered to be unsafe in a requirements file:
pip==22.3.1`,
];

export const runtime_in = [
	"runtime.in",
	`twine
id ~= 1.0
requests
pkginfo != 1.9.0`,
];
export const runtime_txt = [
	"runtime.txt",
	`#
# This file is autogenerated by pip-compile with Python 3.11
# by the following command:
#
#    pip-compile --allow-unsafe --output-file=requirements/runtime.txt --resolver=backtracking --strip-extras requirements/runtime.in
#
bleach==5.0.1
    # via readme-renderer
certifi==2022.12.7
    # via requests
cffi==1.15.1
    # via cryptography
charset-normalizer==2.1.1
    # via requests
commonmark==0.9.1
    # via rich
cryptography==41.0.0
    # via secretstorage
docutils==0.19
    # via readme-renderer
id==1.0.0
    # via -r runtime.in
idna==3.4
    # via requests
importlib-metadata==5.1.0
    # via
    #   keyring
    #   twine
jaraco-classes==3.2.3
    # via keyring
jeepney==0.8.0
    # via
    #   keyring
    #   secretstorage
keyring==23.11.0
    # via twine
more-itertools==9.0.0
    # via jaraco-classes
pkginfo==1.10.0
    # via
    #   -r runtime.in
    #   twine
pycparser==2.21
    # via cffi
pydantic==1.10.6
    # via id
pygments==2.13.0
    # via
    #   readme-renderer
    #   rich
readme-renderer==37.3
    # via twine
requests==2.31.0
    # via
    #   -r runtime.in
    #   id
    #   requests-toolbelt
    #   twine
requests-toolbelt==0.10.1
    # via twine
rfc3986==2.0.0
    # via twine
rich==12.6.0
    # via twine
secretstorage==3.3.3
    # via keyring
six==1.16.0
    # via bleach
twine==4.0.1
    # via -r runtime.in
typing-extensions==4.5.0
    # via pydantic
urllib3==1.26.13
    # via
    #   requests
    #   twine
webencodings==0.5.1
    # via bleach
zipp==3.11.0
    # via importlib-metadata`,
];
