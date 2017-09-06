"use strict";
var _ = require('lodash');
/**
 * 基于字符串查找和正则匹配的轻量级html解析库
 * 适用于快速抽取页面内容
 * @constructor
 */
function Parser() {
};
module.exports = Parser;
/**
 * 抽取关键字前后的一段字符串
 * @param content 源文本
 * @param locator 查找关键字
 * @param leftLen 关键字左侧抽取的长度
 * @param rightLen 关键字右侧抽取的长度
 * @returns {*}
 * content eg:
 *  <a data-album-headtitle="title" data-pb="r=大头部播放&amp;rtgt=iqiyi&amp;client=web" rseat="title_h1"
 *  href="http://www.iqiyi.com/v_19rr7hix8s.html#vfrm=13-0-0-1" title="河神" target="_blank" movlibalbumaid="206302301"
 *  movlibalbumplay="loction2Watched" data-js-stats="qpid=212631214&amp;cid=2" j-delegate="videoLibAddPlayHistory"
 *  data-videolib-playhistory="agentType=1&amp;qipuId=212631214&amp;channelId=2&amp;
 *  videoLink=http://www.iqiyi.com/v_19rr7hix8s.html#vfrm=13-0-0-1&amp;videoName=河神&amp;showInfo=看到1集">河神
 *  </a>
 *
 * Parser.getTextRange(content, '大头部播放', 10, 10) => "ata-pb="r=大头部播放&amp;"
 * Parser.getTextRange(content, ['关键字1', '关键字2'], 10, 10)  按照参数数组中的顺序依次查找关键字，以第一个查找到的关键字为准
 */
Parser.getTextRange = function getTextRange(content, locator, leftLen, rightLen) {
    var startPos = -1;
    if (locator instanceof RegExp) {
        startPos = content.search(locator);
    }
    else if (typeof locator == 'object') {
        for (var index in locator) {
            startPos = content.indexOf(locator[index]);
            if (startPos >= 0) {
                break;
            }
        }
    }
    else {
        startPos = content.indexOf(locator);
    }
    if (startPos > 0) {
        return content = content.substring(startPos - leftLen, startPos + rightLen);
    }
    return null;
};
/**
 * 查找关键字所在的偏移量
 * @param content    源字符串
 * @param locator {RegExp|[key1,key2,...]|String}   关键字
 * @returns {*}
 *
 * Parser.findPivotIndex(content, ['key1', 'key2'])
 *  //=> { "index": 0, "pivot": "key1"}
 */
Parser.findPivotIndex = function findPivotIndex(content, locator) {
    if (content == null) {
        return null;
    }
    var startPos = -1;
    var pivot = locator;
    if (locator instanceof RegExp) {

        var matches = content.match(locator);
        if (matches != null && matches.length > 0) {
            startPos = matches.index;
            pivot = matches[0];
        }
    }
    else if (typeof locator == 'object') {
        for (var index in locator) {
            startPos = content.indexOf(locator[index]);
            if (startPos >= 0) {
                pivot = locator[index];
                break;
            }
        }
    }
    else {
        startPos = content.indexOf(locator);
    }
    return {
        "index": startPos,
        "pivot": pivot
    };
}
/**
 * 抽取关键字前的一段文本
 * @param content   源文本
 * @param locator   关键字
 * @param length    抽取长度
 * @param hasTag    抽取内容是否包含关键字
 * @returns {*}
 */
Parser.getTextRangeBefore = function getTextRangeBefore(content, locator, length, hasTag) {
    var result = this.findPivotIndex(content, locator);
    var startPos = result['index'];
    var pivot = result['pivot'];
    if (startPos > 0) {
        var endPos = hasTag ? startPos + pivot.length : startPos;
        return content = content.substring(startPos - length, endPos);
    }
    return null;
};
/**
 * 抽取关键字后的一段文本
 * @param content   源文本
 * @param locator   关键字
 * @param length    抽取长度
 * @param hasTag    抽取内容是否包含关键字
 * @returns {*}
 */
Parser.getTextRangeAfter = function getTextRangeAfter(content, locator, length, hasTag) {
    var result = this.findPivotIndex(content, locator);
    var startPos = result['index'];
    var pivot = result['pivot'];
    if (startPos > 0) {
        if (!hasTag) {
            startPos = startPos + pivot.length;
        }
        return content = content.substring(startPos, startPos + length);
    }
    return null;
};
/**
 * 获取两个标签内的内容
 * @param content   源文本
 * @param leftTag   左侧标签文本
 * @param rightTag  右侧标签文本
 * @param hasTag    是否包含查找的标签本身
 * @param fromIndex 源文本查找的偏移量， 适用于知道被查找内容在源文本中的大概位置， 提升查询效率
 * @returns {*}
 */
Parser.getBetween = function getBetween(content, leftTag, rightTag, hasTag, fromIndex) {
    if (content == null) {
        return null;
    }
    hasTag = (hasTag !== undefined) ? hasTag : false;
    fromIndex = (fromIndex !== undefined) ? fromIndex : 0;
    var startPos = content.indexOf(leftTag, fromIndex);
    // 没有查找到元素的情况
    if (startPos < 0) {
        return null;
    }
    var endFromIndex = startPos > 0 ? startPos + leftTag.length : fromIndex;
    var endPos = content.indexOf(rightTag, endFromIndex);
    if (!hasTag) {
        startPos = startPos - leftTag.length;
    }
    else {
        endPos = endPos + rightTag.length;
    }
    content = content.substring(startPos, endPos);
    return content;
};
/**
 * 获取正则表达式所匹配的内容
 * @param content  源文本
 * @param reg      查找的正则表达式
 * @returns {*}
 */
Parser.getMatches = function getMatches(content, reg) {
    var result = null;
    if (content !== null) {
        var matches = content.match(reg);
        if (matches != null && matches.length > 0) {
            result = matches.slice(0, matches.length);
        }
    }
    return result;
}
/**
 * 获取指定文本中的所有url
 * @param content   源文本
 * @param withQuery{RegExp|null} 需要匹配的正则表单式
 * @returns {Array|null}
 */
Parser.getUrlLinks = function getUrlLinks(content, withQuery) {
    withQuery = withQuery !== undefined ? withQuery : false;
    var reg = /href=\"(.[^"'?; ]+)/g;
    if (withQuery) {
        reg = /href=\"(.[^"'; ]+)/g;
    }
    var matches = this.getMatches(content, reg);
    if (matches == null) {
        return null;
    }
    var links = _.map(matches, function (value, index) {
        return value.substr(6);
    });
    return links;
}
/**
 * 获取文本中匹配的第一条url
 * @param content {string}          源文本
 * @param dft {string|null}         如果匹配为空时默认返回值
 * @param withQuery {RegExt|null}   url正则表达式
 * @returns {string|null}
 */
Parser.getUrlLink = function getUrlLink(content, dft, withQuery) {
    withQuery = withQuery !== undefined ? withQuery : false;
    var reg = /href=\"(.[^"'? \-]+)/g;
    if (withQuery) {
        reg = /href=\"(.[^"' ]+)/g;
    }
    var link = dft === undefined ? null : dft;
    if (content != null) {
        var matches = this.getMatches(content, reg);
        if (matches != null && matches.length > 0) {
            link = matches[0].substr(6);
        }
    }
    return link;
};
/**
 * 获取最后一个匹配的内容
 * @param content {string} 源文本
 * @param reg  {RegExp} 正则表达式
 * @returns {*}
 */
Parser.getLastMatch = function getLastMatch(content, reg) {
    var result = null;
    var matches = this.getMatches(content, reg);
    if (matches !== null) {
        result = matches.pop();
    }
    return result;
}
/**
 * 获取文本中的所有中文
 * @param content {string}    源文本
 * @param reg {RegExp|null}   中文正则表达式
 * @returns {Array|null}
 */
Parser.getChineseWords = function getChineseWords(content, reg) {
    reg = reg || />([\u4e00-\u9fa5\w]+)</;
    var result = null;
    if (content !== null) {
        var matches = content.match(reg);
        if (matches != null && matches.length > 0) {
            result = matches.slice(1, matches.length);
        }
    }
    return result;
};
/**
 * 获取标签内部的文本
 * @param content {string}   标签
 * @param reg {RegExp|null}
 * @returns {*}
 *
 * correct:
 * Parser.getTagText('<p>this is a test string<p>')
 * //=> 'this is a test string'
 * wrong:
 * Parser.getTagText('<p>this is <span>a</span> test string<p>')
 * //=> 'this is '
 */
Parser.getTagText = function getTagContent(content, reg) {
    reg = reg || />[^<]*<\//g;
    var result = null;
    if (content !== null) {
        var matches = content.match(reg);
        if (matches != null && matches.length > 0) {
            result = _.map(matches, function (value, index) {
                return value.slice(1, -2);
            });
        }
    }
    return result;
};
/**
 * 获取标签内的html
 * @param content {string}   标签
 * @param reg {RegExp|null}
 * @returns {string|null}
 * Parser.getTagHtml('<p>this is a <span>test</span> string<p>')
 * //=> 'this is a <span>test</span> string'
 */
Parser.getTagHtml = function getTagHtml(content, reg) {
    reg = reg || />(.[^><]*)</;
    var html = null;
    if (content != null) {
        var matches = content.match(reg);
        if (matches != null && matches.length > 0) {
            html = matches[1];
        }
    }
    return html;
}
/**
 * 查找包含指定内容的标签
 * 查找的标签内容不能重复嵌套
 * @param content {string}    源文本
 * @param tagType  {string}   标签类型
 * @param includes  {array|callback}   标签过滤规则
 * @param excludes {Boolean|null}  是否反向过滤
 * @returns {*}
 *
 * Parser.getTag(res.body, 'div', ['act-status', 'act-move-up'])
 * Parser.getTag(res.body, 'div', function (tag){
 *     // do filters here
 * })
 */
Parser.getTag = function getTag(content, tagType, includes, excludes) {
    if (content == null) {
        return null;
    }
    var tags = Parser.getTags(content, tagType, includes, excludes, 1);
    var tag = null;
    if (tags != null && tags.length > 0) {
        tag = tags[0];
    }
    return tag;
}
/**
 * 获取包含指定文本的标签
 * @param content   {string}  源文本
 * @param tagText   {string}  包含的文本内容
 * @param tag       {string|null}  标签类型
 * @param reg       {RegExp|null}  标签匹配规则
 * @returns {*}
 * eg:
 * Parser.getTagByText(res.body, '文本内容', 'span')
 * //=> <span>这是一段文本内容</span>
 */
Parser.getTagByText = function getTagByText(content, tagText, tag, reg) {
    if (reg == null) {
        if (tag != null) {
            var regText = "<(" + tag + ")[^>]+>(((?!\\1]).)+)?(?=" + tagText + ")(((?!\\1]).)+)?<\/\\1>";
        }
        else {
            var regText = "<([a-z\\d]+).[^>]+>" + tagText + "<\/\\1>";
        }
        reg = new RegExp(regText, "i");
    }
    var matches = this.getMatches(content, reg);
    var tag = null;
    if (matches !== null) {
        tag = matches[0];
    }
    return tag;
};
/**
 * 转码常用的html实体
 * @param html   {string} 源文本
 * @returns {string}
 */
Parser.htmlEntityDecode = function htmlEntityDecode(html) {
    var reg = /&.[^;]*;/g;
    var entityMap = {
        "&#160;": " ",
        "&nbsp;": " ",
        "&lt;": "<",
        "&#60;": "<",
        "&gt;": ">",
        "&#62;": ">",
        "&amp;": "&",
        "&#38;": "&",
    };
    return html.replace(reg, function (entity) {
        var text = entityMap[entity];
        if (text === undefined) {
            throw new Error('unsupport entity transform: ' + entity)
        }
        return text;
    });
}
/**
 * 去除html中的换行符
 * @param content  {string}  源文本
 * @param replace  {string}  换行符替换的字符， 默认为空
 * @returns {*}
 */
Parser.filterCr = function filterCr(content, replace) {
    if (content == null) {
        return null;
    }
    var reg = /\t|\r\n|\r|\n/g;
    replace = replace == undefined ? '' : replace;
    return content.replace(reg, replace);
};
Parser.getSimpleTag = function getSimpleTag(content, tag, includes, attr) {
    if (includes != null) {
        var regText = "<(" + tag + ")([^>]+)(?=" + includes + ")([^>]+)>[^<]{0,}<\/\\1>";
    }
    else {
        var regText = "<(" + tag + ")([^>]*)>[^<]+<\/\\1>";
    }

    attr = attr == undefined ? 'ig' : attr;
    var reg = new RegExp(regText, attr);
    return this.getMatches(content, reg);
};
/**
 * 查找标签
 * @param content  {string}  源文本
 * @param tagType  {string}  标签类型：div, span,...
 * @param includes  {array|callback}   标签过滤规则
 * @param excludes {Boolean|null}  是否反向过滤
 * @param queryLimit {number|null} 标签查找的个数
 * @returns {*}
 *
 * Parser.getTags(res.body, 'div', ['act-status', 'act-move-up']， 1)
 * Parser.getTags(res.body, 'div', function (tag){
 *     // do filters here
 * })
 */
Parser.getTags = function getTags(content, tagType, includes, excludes, queryLimit) {
    var body = content;
    if (typeof content != 'string') {
        return null;
    }
    if (includes == null && excludes == null) {
        var regText = "<" + tagType + "[^>]*>(?:(?!<\/" + tagType + ">).)*<\/" + tagType + ">";
        var reg = new RegExp(regText, 'ig');
        var matches = content.match(reg);
        return matches;
    }
    if (typeof includes == 'string') {
        includes = [includes];
    }
    if (typeof excludes == 'string') {
        excludes = [excludes];
    }
    if (queryLimit == undefined) {
        queryLimit = 0;
    }
    // 需要匹配的特定的元素
    var startTag = '<' + tagType;
    var endTag = '</' + tagType + '>';
    var subTagReg = new RegExp('<' + tagType + '[^>]*>', 'i');
    var matches = [];
    var curPos = 0,
        curTagPos, curTagEnd, curTag;
    while ((curTagPos = content.indexOf(startTag, curPos)) >= 0) {
        // 获取当前标签的完整内容
        // eg: content = <div class="box-series"><ul class="panel">
        // curTag(<div), pos: 0, '>'pos: 24
        // fullStartTag = <div class="box-series">
        curTagEnd = content.indexOf('>', curTagPos);
        // 如果标签不合法 <tag attrs>
        if (curTagEnd < 0) {
            break;
        }
        curTag = content.slice(curTagPos, curTagEnd + 1);
        var tagIncluded = 0;
        var tagExcluded = 0;
        // 标签包含指定条件
        includes && includes.forEach(function (include) {
            var match = 0;
            if (typeof include == 'function') {
                match = include(curTag);
            }
            else {
                match = curTag.indexOf(include) >= 0 ? 1 : 0;
            }
            tagIncluded += match;
        });
        // 标签不包含指定条件
        excludes && excludes.forEach(function (exclude) {
            var match = 0;
            if (typeof exclude == 'function') {
                match = exclude(curTag);
            }
            else {
                match = curTag.indexOf(exclude) >= 0 ? 1 : 0;
            }
            tagExcluded += match;
        });
        curPos = curTagEnd;
        // 如果标签没有包含指定的内容则跳过标签
        if (includes && tagIncluded != includes.length) {
            continue;
        }
        // 如果标签包含了指定的内容也跳过标签
        if (excludes && tagExcluded > 0) {
            continue;
        }
        // 裁剪需要匹配的内容
        content = content.slice(curTagPos);
        // 查找匹配标签对应的闭合标签
        var count = 1,
            nextEndTagPos = content.indexOf(endTag),
            nextStartTagPos = 0,
            lastEndTagPos;
        // 标签未正确闭合
        if (nextEndTagPos < 0) {
            var err = new Error('illegal html');
            err.body = body;
            throw err;
        }
        nextStartTagPos = content.indexOf(startTag, nextStartTagPos + startTag.length);
        // var a2 = content.slice(nextStartTagPos, content.indexOf('>', nextStartTagPos)+1);
        while (nextStartTagPos < content.length && nextEndTagPos < content.length) {
            // 如果闭合标签内有其它标签
            if (nextStartTagPos > 0 && nextStartTagPos < nextEndTagPos) {
                // 嵌套层数加1
                count++;
                nextStartTagPos = content.indexOf(startTag, nextStartTagPos + startTag.length);
                if (nextStartTagPos < 0) {
                    nextStartTagPos = content.length - 1;
                }
            }
            else {
                count--;
                lastEndTagPos = nextEndTagPos;
                // 处理有标签嵌套的情况, 如果下一个标签未正确闭合则抛出异常
                if (nextStartTagPos > 0) {
                    nextEndTagPos = content.indexOf(endTag, nextEndTagPos + endTag.length);
                    if (nextEndTagPos < 0 && count != 0) {
                        var a = content.slice(0, nextEndTagPos);
                        var err = new Error('illegal html');
                        err.body = body;
                        throw err;
                    }
                }
            }
            if (count == 0) {
                break;
            }
        }
        // slice 后的子字符串和原字符串会使用同一块内存, 某些情况下会导致内存泄漏
        // srcStr[0-255] -> subStr[0-32]  : subStr retained whole memory[0-255]
        // @110             @110
        // 通过添加空字符串然后去除解绑子字符串与源字符串, 杜绝内存泄漏
        var matchedTag = (content.slice(0, lastEndTagPos + endTag.length) + ' ').slice(0, -1);
        matches.push(matchedTag);
        content = content.slice(lastEndTagPos + endTag.length);
        curPos = 0;
        // 到达查找数量限制时退出查找
        if (queryLimit > 0 && matches.length >= queryLimit) {
            break;
        }
    }
    return matches;
};
/**
 * 获取标签的所有属性
 * @param tag  {string}  标签html
 * @returns {{}}
 */
Parser.parseAttributes = function parseAttr(tag) {
    var tagEnd = tag.indexOf('>');
    if (tagEnd > 0) {
        tag = tag.substring(0, tagEnd + 1);
    }
    var reg = /([^ =]+)="([^"]*)"/g;
    var attributes = {};
    tag.replace(reg, function (m0, attr, value) {
        attributes[attr] = value;
        return m0;
    });
    return attributes;
};
/**
 * 获取标签的属性
 * @param tag
 * @param attrName
 * @returns {null}
 */
Parser.getAttribute = function getAttribute(tag, attrName) {
    var attrs = Parser.parseAttributes(tag);
    return attrs.hasOwnProperty(attrName) ? attrs[attrName] : null;
};
/**
 * 解析jsonP为对象
 * @param result  {string} jsonp 文本
 * @returns {*}
 */
Parser.parseJSONP = function _parseJSONP(result) {
    var text = result.substring(result.indexOf('(') + 1, result.lastIndexOf(')'));
    var jsonData = null;
    try {
        jsonData = JSON.parse(text);
    }
    catch (error) {
        result = null;
    }
    return jsonData;
};

