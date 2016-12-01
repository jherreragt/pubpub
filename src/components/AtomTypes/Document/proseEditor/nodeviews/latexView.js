import {LatexEditor} from '../components';
import React from 'react';
import ReactDOM from 'react-dom';
import {schema} from '../schema';

function wrapDOM(dom) {
  let dummy = document.createElement("div")
  dummy.textContent = "\u200b"
  dummy.style.height = 0
  let wrap = document.createElement("div")
  wrap.appendChild(dummy.cloneNode(true))
  wrap.appendChild(dom)
  wrap.appendChild(dummy)
  return wrap
}

function computeChange(oldVal, newVal) {
  let start = 0, oldEnd = oldVal.length, newEnd = newVal.length
  while (start < oldEnd && oldVal.charCodeAt(start) == newVal.charCodeAt(start)) ++start
  while (oldEnd > start && newEnd > start &&
         oldVal.charCodeAt(oldEnd - 1) == newVal.charCodeAt(newEnd - 1)) { oldEnd--; newEnd-- }
  return {from: start, to: oldEnd, text: newVal.slice(start, newEnd)}
}

class LatexView {
  constructor(node, view, getPos, options) {
    this.valueChanged = this.valueChanged.bind(this);
    this.block = options.block;

    this.node = node
    this.view = view
    this.getPos = getPos
    this.value = node.textContent
    const domChild = (this.block) ? document.createElement('div') : document.createElement('span');
		const reactElement = ReactDOM.render(<LatexEditor block={this.block} updateValue={this.valueChanged} value={this.value}/>, domChild);
		const dom = domChild.childNodes[0];
    dom.contentEditable = false;
    this.dom = domChild;
    this.reactElement = reactElement;
  }

  /*
  valueChanged() {
    let value = this.cm.getValue()
    if (value != this.value) {
      let change = computeChange(this.value, value)
      this.value = value
      let start = this.getPos() + 1
      let tr = this.view.state.tr.replaceWith(start + change.from, start + change.to,
                                              change.text ? schema.text(change.text) : null)
      this.view.props.onAction(tr.action())
    }
  }

  maybeEscape(unit, dir) {
    let pos = this.cm.getCursor()
    if (this.cm.somethingSelected() || pos.line != (dir < 0 ? this.cm.firstLine() : this.cm.lastLine()) ||
        (unit == "char" && pos.ch != (dir < 0 ? 0 : this.cm.getLine(pos.line).length)))
      return CodeMirror.Pass
    this.view.focus()
    let targetPos = this.getPos() + (dir < 0 ? 0 : this.value.length + 2)
    this.view.props.onAction(Selection.near(this.view.state.doc.resolve(targetPos), dir).action())
  }
  */

  valueChanged(value) {
    if (value != this.value) {
      let change = computeChange(this.value, value)
      this.value = value
      let start = this.getPos() + 1
      let tr = this.view.state.tr.replaceWith(start + change.from, start + change.to,
                                              change.text ? schema.text(change.text) : null)
      this.view.props.onAction(tr.action())
    }
  }

  update(node) {
    if (node.type != this.node.type) return false
    this.node = node;
    this.reactElement = ReactDOM.render(<LatexEditor block={this.block} updateValue={this.valueChanged} value={this.value}/>, this.dom);
    return true
  }

  changeToBlock() {

  }

  /*
  setSelection(anchor, head) {
    this.cm.focus()
    this.cm.setSelection(this.cm.posFromIndex(anchor), this.cm.posFromIndex(head))
  }

  selectNode() {
    this.cm.focus()
  }
  */

  stopEvent() { return true }
}

export default LatexView;
