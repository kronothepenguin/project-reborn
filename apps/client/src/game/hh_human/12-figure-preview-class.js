export default class {
	createTemplateHuman(tSize, tdir, tAction, tActionProps) {
		tObjectName = "temp_humanobj"
		tFigure = getObject(Symbol.for("session")).GET("user_figure").duplicate()
		tmember = me.createTemplateFigure(tObjectName, tFigure, tSize, tdir)
		switch (tAction) {
			case "remove":
				removeObject(tObjectName);
				break;
			case "reset":
				call(Symbol.for("resetTemplateHuman"), [getObject(tObjectName)]);
				break;
			default:
				call(symbol(`action_${tAction}`), [getObject(tObjectName)], tActionProps);
				break;
		}
		return tmember
	}

	getHumanPartImg(tPartList, tFigure, tdir, tSize) {
		if (voidp(tFigure)) {
			tFigure = getObject(Symbol.for("session")).GET("user_figure")
			if (tFigure.ilk == Symbol.for("propList")) {
				tFigure = tFigure.duplicate()
			} else {
				return error(me, "Figure data not found!", Symbol.for("getHumanPartImg"), Symbol.for("major"))
			}
		}
		tObjectName = "humanobj_temp_temp"
		if (voidp(tdir)) {
			tdir = 3
		}
		if (voidp(tSize)) {
			tSize = "h"
		}
		me.createTemplateFigure(tObjectName, tFigure, tSize, tdir)
		tTempPartImg = image(64, 102, 16)
		call(Symbol.for("getPartialPicture"), [getObject(tObjectName)], tPartList, tTempPartImg, tdir)
		tTempPartImg = tTempPartImg.trimWhiteSpace()
		removeObject(tObjectName)
		return tTempPartImg
	}

	createHumanPartPreview(tWindowTitle, tElement, tPartList, tFigure, tdir, tSize) {
		tTempPartImg = me.getHumanPartImg(tPartList, tFigure, tdir, tSize)
		if (tTempPartImg.ilk == Symbol.for("image")) {
			me.feedHumanPreview(tWindowTitle, tElement, tTempPartImg)
		}
	}

	createTemplateFigure(tObjectName, tFigure, tSize, tdir) {
		if (!objectExists(tObjectName)) {
			if (!createObject(tObjectName, ["Human Class EX", "Human Template Class"])) {
				return error(me, "Failed to init temporary human object!", Symbol.for("createTemplateFigure"), Symbol.for("major"))
			}
			tProps = propList()
			tProps[Symbol.for("userName")] = "temp_human_figurecreator"
			tProps[Symbol.for("figure")] = tFigure
			tProps[Symbol.for("direction")] = list(tdir, 1, 1)
			tProps[Symbol.for("x")] = 10000
			tProps[Symbol.for("y")] = 10000
			tProps[Symbol.for("h")] = 10000
			if (tSize == "sh") {
				tProps[Symbol.for("type")] = 32
			} else {
				tProps[Symbol.for("type")] = 64
			}
			tmember = getObject(tObjectName).define(tProps)
		} else {
			tmember = getObject(tObjectName).getMember()
		}
		return tmember
	}

	feedHumanPreview(tWindowTitle, tElemID, tTempPartImg) {
		if (windowExists(tWindowTitle)) {
			tElem = getWindow(tWindowTitle).getElement(tElemID)
			if (tElem == 0) {
				return 0
			}
			tPrewImg = image(tElem.getProperty(Symbol.for("width")), tElem.getProperty(Symbol.for("height")), 16)
			tdestrect = tPrewImg.rect - tTempPartImg.rect
			tMargins = rect(0, 0, 0, 0)
			tdestrect = rect(tdestrect.width / 2, tdestrect.height / 2, tTempPartImg.width + (tdestrect.width / 2), (tdestrect.height / 2) + tTempPartImg.height) + tMargins
			tPrewImg.copyPixels(tTempPartImg, tdestrect, tTempPartImg.rect, propList(Symbol.for("ink"), 8))
			tElem.clearImage()
			tElem.feedImage(tPrewImg)
		}
	}
}
