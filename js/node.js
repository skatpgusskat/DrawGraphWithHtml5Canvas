'use strict';

const DrawingLinePointRadius = 4;
const DrawingLinePointDirection = {
    TOP: 'TOP',
    RIGHT: 'RIGHT',
    BOTTOM: 'BOTTOM',
    LEFT: 'LEFT'
};
const ScalingPointDirection = {
    TOP_RIGHT: 'TOP_RIGHT',
    BOTTOM_RIGHT: 'BOTTOM_RIGHT',
    BOTTOM_LEFT: 'BOTTOM_LEFT',
    TOP_LEFT: 'TOP_LEFT'
};

const DrawableType = {
    IMG: 'IMG',
    CANVAS_DRAWING_FUNCTION: 'function'
};

function Node(drawable, x, y, width, height) {
    // constructor

    this.drawable = drawable;
    if (typeof drawable === 'object' && drawable.tagName && drawable.tagName === 'IMG') {
        this.drawableType = DrawableType.IMG;
        this.image = this.drawable;
        this.width = width || this.image.width;
        this.height = height || this.image.height;
    }
    else if (typeof drawable === 'function') {
        this.drawableType = DrawableType.CANVAS_DRAWING_FUNCTION;
        this.width = width;
        this.height = height;

    }
    this.x = x;
    this.y = y;
    var scaleX = 1;
    var scaleY = 1;

    this.linesOfDirection = {};
    this.linesOfDirection[DrawingLinePointDirection.TOP] = [];
    this.linesOfDirection[DrawingLinePointDirection.BOTTOM] = [];
    this.linesOfDirection[DrawingLinePointDirection.LEFT] = [];
    this.linesOfDirection[DrawingLinePointDirection.RIGHT] = [];
    this.highlightedDrawingLinePointDirection = undefined; // or DrawingLinePointDirection




    this.onRender = function (ctx, isFocus, isClicked) {
        switch (this.drawableType) {
        case DrawableType.CANVAS_DRAWING_FUNCTION:
            ctx.translate(this.x, this.y);
            ctx.scale(scaleX, scaleY);
            this.drawable(ctx);
            ctx.scale(1 / scaleX, 1 / scaleY);
            ctx.translate(-this.x, -this.y);
            break;
        case DrawableType.IMG:
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
            break;
        }
        if (isFocus) {
            for (var direction in DrawingLinePointDirection) {
                var position = this.getDrawingLinePointPosition(DrawingLinePointDirection[direction]);
                ctx.beginPath();
                ctx.arc(position.x, position.y, DrawingLinePointRadius, 0, 2 * Math.PI);
                ctx.fillStyle = "red";
                ctx.fill();
                if (this.highlightedDrawingLinePointDirection == direction) {
                    ctx.strokeStyle = "black";
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }
        if (isClicked) {
            ctx.beginPath();
            ctx.strokeStyle = "blue";
            ctx.lineWidth = 5;
            var clickedBorder = 10;
            var minimumWidthBorder = this.width / 5;
            var minimumHeightBorder = this.height / 5;
            // 왼쪽 위
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + Math.min(clickedBorder, minimumWidthBorder), this.y);
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x, this.y + Math.min(clickedBorder, minimumHeightBorder));
            // 오른쪽 위
            ctx.moveTo(this.x + this.width, this.y);
            ctx.lineTo(this.x + this.width - Math.min(clickedBorder, minimumWidthBorder), this.y);
            ctx.moveTo(this.x + this.width, this.y);
            ctx.lineTo(this.x + this.width, this.y + Math.min(clickedBorder, minimumHeightBorder));
            // 왼쪽 아래
            ctx.moveTo(this.x, this.y + this.height);
            ctx.lineTo(this.x + Math.min(clickedBorder, minimumWidthBorder), this.y + this.height);
            ctx.moveTo(this.x, this.y + this.height);
            ctx.lineTo(this.x, this.y + this.height - Math.min(clickedBorder, minimumHeightBorder));
            // 오른쪽 아래
            ctx.moveTo(this.x + this.width, this.y + this.height);
            ctx.lineTo(this.x + this.width - Math.min(clickedBorder, minimumWidthBorder), this.y + this.height);
            ctx.moveTo(this.x + this.width, this.y + this.height);
            ctx.lineTo(this.x + this.width, this.y + this.height - Math.min(clickedBorder, minimumHeightBorder));

            ctx.stroke();
        }

    };

    this.getScaleX = function () {
        return scaleX;
    };
    this.setScaleX = function (newScaleX) {
        this.width = (this.width / scaleX) * newScaleX;
        scaleX = newScaleX;
    };
    this.getScaleY = function () {
        return scaleY;
    };
    this.setScaleY = function (newScaleY) {
        this.height = (this.height / scaleY) * newScaleY;
        scaleY = newScaleY;
    };

    this.moveBy = function (dx, dy) {
        this.x += dx;
        this.y += dy;
    };

    this.isInBound = function (x, y) {
        if (this.x <= x && x <= this.x + this.width && this.y <= y && y <= this.y + this.height) {
            return true;
        }
        return false;
    };

    this.isInDrawingLinePointBound = function (x, y) {
        if (this.isInBound(x, y)) {
            var radius = DrawingLinePointRadius;

            // left or right
            if (this.y + (this.height) / 2 - radius <= y && y <= this.y + (this.height) / 2 + radius) {
                if (this.x <= x && x <= this.x + 2 * radius) {
                    return DrawingLinePointDirection.LEFT;
                }
                else if (this.x + this.width - 2 * radius <= x && x <= this.x + this.width) {
                    return DrawingLinePointDirection.RIGHT;
                }
            }
            // up or down
            else if (this.x + (this.width) / 2 - radius <= x && x <= this.x + (this.width) / 2 + radius) {
                // up
                if (this.y <= y && y <= this.y + 2 * radius) {
                    return DrawingLinePointDirection.TOP;
                }
                // down
                else if (this.y + this.height - 2 * radius <= y && y <= this.y + this.height) {
                    return DrawingLinePointDirection.BOTTOM;
                }
                console.log(this.y, this.height, y, this.y + this.height - 2 * radius);
            }
        }
        return false;
    };

    this.getLineStartPosition = function (drawingLinePointDirection) {
        var radius = DrawingLinePointRadius;
        if (drawingLinePointDirection === DrawingLinePointDirection.LEFT) {
            return {
                x: this.x,
                y: this.y + (this.height) / 2
            };
        }
        else if (drawingLinePointDirection === DrawingLinePointDirection.RIGHT) {
            return {
                x: this.x + this.width,
                y: this.y + (this.height) / 2
            };
        }
        else if (drawingLinePointDirection === DrawingLinePointDirection.TOP) {
            return {
                x: this.x + (this.width) / 2,
                y: this.y
            };
        }
        else if (drawingLinePointDirection === DrawingLinePointDirection.BOTTOM) {
            return {
                x: this.x + (this.width) / 2,
                y: this.y + this.height
            };
        }
        return undefined;
    };

    this.getDrawingLinePointPosition = function (drawingLinePointDirection) {
        var radius = DrawingLinePointRadius;
        if (drawingLinePointDirection === DrawingLinePointDirection.LEFT) {
            return {
                x: this.x + radius,
                y: this.y + (this.height) / 2
            };
        }
        else if (drawingLinePointDirection === DrawingLinePointDirection.RIGHT) {
            return {
                x: this.x + this.width - radius,
                y: this.y + (this.height) / 2
            };
        }
        else if (drawingLinePointDirection === DrawingLinePointDirection.TOP) {
            return {
                x: this.x + (this.width) / 2,
                y: this.y + radius
            };
        }
        else if (drawingLinePointDirection === DrawingLinePointDirection.BOTTOM) {
            return {
                x: this.x + (this.width) / 2,
                y: this.y + this.height - radius
            };
        }
        return undefined;
    };

    this.getNearestDrawingLinePointDirection = function (x, y) {
        var minDistanceSquare;
        var minDirection;
        for (var i in DrawingLinePointDirection) {
            var direction = DrawingLinePointDirection[i];
            var position = this.getDrawingLinePointPosition(direction);
            var distanceSquare = (position.x - x) * (position.x - x) + (position.y - y) * (position.y - y);
            if (!!!minDistanceSquare || distanceSquare < minDistanceSquare) {
                minDistanceSquare = distanceSquare;
                minDirection = direction;
            }
        }
        return minDirection;
    };

    // SCALING
    this.getScalingPointPosition = function (scalingPointDirection) {
        switch (scalingPointDirection) {
        case ScalingPointDirection.TOP_RIGHT:
            return {
                x: this.x + this.width,
                y: this.y
            };
        case ScalingPointDirection.BOTTOM_RIGHT:
            return {
                x: this.x + this.width,
                y: this.y + this.height
            };
        case ScalingPointDirection.BOTTOM_LEFT:
            return {
                x: this.x,
                y: this.y + this.height
            };
        case ScalingPointDirection.TOP_LEFT:
            return {
                x: this.x,
                y: this.y
            };
        }
    };

    this.getNearestScalingPointDirection = function (x, y) {
        var minDistanceSquare;
        var minDirection;
        for (var i in ScalingPointDirection) {
            var direction = ScalingPointDirection[i];
            var position = this.getScalingPointPosition(direction);
            var distanceSquare = (position.x - x) * (position.x - x) + (position.y - y) * (position.y - y);
            if (!!!minDistanceSquare || distanceSquare < minDistanceSquare) {
                minDistanceSquare = distanceSquare;
                minDirection = direction;
            }
        }
        return minDirection;
    };

    this.addLineofDirection = function (line, direction) {
        this.linesOfDirection[direction].push(line);
    };
}