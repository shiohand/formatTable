init();

function init() {
  // メイン使用要素
  const pasteBox = document.getElementById('paste-box');
  const outputBox = document.getElementById('output-box');
  const previewBox = document.getElementById('preview-box');
  const addTableTagBtn = document.getElementById('add-table-tag');

  // リセット
  outputBox.value = '';

  // イベントハンドラ
  pasteBox.addEventListener('input', outputTable);
  pasteBox.addEventListener('click', e => e.target.select()); // click時全選択（ついで）
  outputBox.addEventListener('click', e => e.target.select());
  addTableTagBtn.addEventListener('click', addTableTag);

  let keepTags = ['table', 'tr', 'th', 'td', 'caption', 'p'];
  let tagPatt = '';
  keepTags.forEach(tag => tagPatt += '(?!'+tag+')');
  let keepAttrs = ['colspan', 'rowspan'];
  let attrPatt = '';
  keepAttrs.forEach(attr => attrPatt += '(?<!'+attr+')');

  // 不要物削除
  let removePatterns = [
    /\n/g,
    /\t/g,
    /<table> ?<\/table>/g,
    new RegExp('<\\/?'+tagPatt+'\\w+ ?.*?>', 'g'), // /<\/?(?!残すタグ達)(?!残すタグ達)\w+ ?.*?>/g,
    new RegExp('\\w*'+attrPatt+'=".*?"', 'g') // /\w*(?<!残す属性達)(?<!残す属性達)=".*?"/g
  ];
  // 個別整形
  let replacePatterns = [
    [/> +</g, '><'],
    [/ +/g, ' '],
    [/ >/g, '>'],
    [/ </g, '<'],
    [/> /g, '>']
  ];
  // 改行整形
  let addRetturnPatterns = [
    [/(?<!^)(?=<)/g, '\n'], // 先頭以外の <の前
    [/(?<=>)(?!\n)(?!$)/g, '\n'], // 末尾以外の 次の字が\nではない >のあと
    [/(?<=<td.*?>)\n(?!<)/g, ''], // <td>の後の \n
    [/(?<!>)\n(?=<\/td>)/g, ''], // </td>の前の \n
    [/(?<=<p.*?>)\n(?!<)/g, ''], // <p>の後の \n
    [/(?<!>)\n(?=<\/p>)/g, ''], // </p>の前の \n
    [/(?<!\/\w*>)\n(?=<\/)/g, ''] // 開始タグ直後 かつ 閉じタグ直前の \n
  ];

  // outputTable()
  function outputTable() {
    let input = pasteBox.innerHTML;
    let output = formatTable(input);
    outputBox.value = output;
    previewBox.innerHTML = output;
  }

  // addTableTag()
  function addTableTag() {
    let input = '<table>' + outputBox.value + '</table>';
    let output = formatTable(input);
    outputBox.value = output;
    previewBox.innerHTML = output;
  }

  // formatTable(string)
  function formatTable(input) {
    removePatterns.forEach(val => input = input.replace(val, ''));
    replacePatterns.forEach(val => input = input.replace(val[0], val[1]));
    addRetturnPatterns.forEach(val => input = input.replace(val[0], val[1]));
    input = makeIndent(input);
    return input;
  }

  // makeIndent(string)
  function makeIndent(input) {
    let lines = input.split('\n');
    const block = '  ';
    const headetag = new RegExp('^ *<\/');
    let indent = '';
    const indentproc = function(line) {
      // 現在のインデントを文頭に追加 現在の行が</>で始まっていたら一つ下げる
      line = indent + line;
      if (headetag.test(line)) {
        line = line.replace(block, '');
      }
      // 文字列中の開始タグと終了タグの個数と差をチェック match()がnullを返す場合のため(|| [])追加
      const stag = (line.match(/<(?!\/)/g) || []).length;
      const etag = (line.match(/<\//g) || []).length;
      const change = stag - etag;
      // indent更新
      if (change < 0) {
        indent = indent.replace(block.repeat(Math.abs(change)), '');
      } else if (1 <= change) {
        indent += block.repeat(change);
      }
      return line;
    }
    lines = lines.map(line => indentproc(line));
    return lines.join('\n');
  }
}