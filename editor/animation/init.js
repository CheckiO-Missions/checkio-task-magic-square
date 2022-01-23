//Dont change it
requirejs(['ext_editor_1', 'jquery_190', 'raphael_210'],
    function (ext, $, TableComponent) {

        var cur_slide = {};

        ext.set_start_game(function (this_e) {
        });

        ext.set_process_in(function (this_e, data) {
            cur_slide["in"] = data[0];
        });

        ext.set_process_out(function (this_e, data) {
            cur_slide["out"] = data[0];
        });

        ext.set_process_ext(function (this_e, data) {
            cur_slide.ext = data;
            this_e.addAnimationSlide(cur_slide);
            cur_slide = {};
        });

        ext.set_process_err(function (this_e, data) {
            cur_slide['error'] = data[0];
            this_e.addAnimationSlide(cur_slide);
            cur_slide = {};
        });

        ext.set_animate_success_slide(function (this_e, options) {
            var $h = $(this_e.setHtmlSlide('<div class="animation-success"><div></div></div>'));
            this_e.setAnimationHeight(112);
        });

        ext.set_animate_slide(function (this_e, data, options) {
            var $content = $(this_e.setHtmlSlide(ext.get_template('animation'))).find('.animation-content');
            if (!data) {
                console.log("data is undefined");
                return false;
            }


            var checkioInput = data.in;

            if (data.error) {
                $content.find('.call').html('Fail: checkio(' + ext.JSON.stringify(checkioInput) + ')');
                $content.find('.output').html(data.error.replace(/\n/g, ","));

                $content.find('.output').addClass('error');
                $content.find('.call').addClass('error');
                $content.find('.answer').remove();
                $content.find('.explanation').remove();
                this_e.setAnimationHeight($content.height() + 60);
                return false;
            }

            var checkioInput = data.in;
            var rightResult = data.ext["answer"];
            var userResult = data.out;
            var result = data.ext["result"];
            var codeError = data.ext["result_addon"]["error_code"];
            var resultMessage = data.ext["result_addon"]["message"];

            //if you need additional info from tests (if exists)
            var explanation = data.ext["explanation"];

            $content.find('.output').html('&nbsp;Your result:&nbsp;' + ext.JSON.stringify(userResult));

            if (!result) {
                $content.find('.call').html('Fail: checkio(' + ext.JSON.stringify(checkioInput) + ')');
                $content.find('.answer').html(resultMessage);
                $content.find('.answer').addClass('error');
                $content.find('.output').addClass('error');
                $content.find('.call').addClass('error');
            }
            else {
                $content.find('.call').html('Pass: checkio(' + ext.JSON.stringify(checkioInput) + ')');
                $content.find('.answer').remove();
            }
            //Dont change the code before it
            if (codeError >= 3){
                var canvas = new MagicSquareCanvas();
                canvas.createCanvas($content.find(".explanation")[0], checkioInput, userResult);
            }




            this_e.setAnimationHeight($content.height() + 60);

        });

        //TRYIT code
        var $tryit;


        //this function process returned data and show it
        ext.set_console_process_ret(function (this_e, ret) {
            try {
                ret = JSON.parse(ret);
            }
            catch(err){}

            $tryit.find(".checkio-result-in").html(ext.JSON.stringify(ret));
        });

        ext.set_generate_animation_panel(function (this_e) {
            $tryit = $(this_e.setHtmlTryIt(ext.get_template('tryit'))).find(".tryit-content");
            var squareTemplate = [
                [0, 7, 0, 16, 0],
                [11, 0, 23, 0, 9],
                [0, 4, 0, 15, 0],
                [10, 0, 17, 0, 1],
                [0, 21, 0, 8, 0]
            ];
            var $square = $tryit.find(".square");
            for (var i =0; i < 5; i++) {
                var $tr = $("<tr></tr>");
                for(var j = 0; j < 5; j++){
                    var $td = $("<td></td>").addClass("cell" + i + j);
                    var $input = $("<input type='text'>");
                    $input.addClass("input-number");
                    $input.val(squareTemplate[i][j]);
                    $td.append($input);
                    $tr.append($td);
                }
                $square.append($tr);
            }

            //run checking
            $tryit.find('.bn-check').click(function (e) {
                var data = [];
                for (var i = 0; i < 5; i++){
                    data.push([]);
                }

                var $inputs = $tryit.find(".input-number");

                $inputs.each(function() {
                    var $this = $(this);
                    var cell = $this.parents().eq(0).attr('class');
                    var row = parseInt(cell[4]);
                    var col = parseInt(cell[5]);
                    var numb = parseInt($this.val());
                    if (isNaN(numb)) {
                        numb = 0;
                        $this.val(0);
                    }
                    data[row][col] = numb;
                });
                //send it for check
                console.log(data);
                this_e.sendToConsoleCheckiO(data);
                //After it will be called set_console_process_ret
                e.stopPropagation();
                return false;
            });

        });



        var colorOrange4 = "#F0801A";
        var colorOrange3 = "#FA8F00";
        var colorOrange2 = "#FAA600";
        var colorOrange1 = "#FABA00";

        var colorBlue4 = "#294270";
        var colorBlue3 = "#006CA9";
        var colorBlue2 = "#65A1CF";
        var colorBlue1 = "#8FC7ED";

        var colorGrey4 = "#737370";
        var colorGrey3 = "#D9E9E";
        var colorGrey2 = "#C5C6C6";
        var colorGrey1 = "#EBEDED";

        var colorWhite = "#FFFFFF";


        function MagicSquareCanvas() {
            var x0 = 10;
            var y0 = 10;
            var cellSize = 40;
            var N;
            var fullSizeX;
            var fullSizeY;



            var fontSize = cellSize * 0.8;

            var attrSquare = {"stroke": colorBlue4, "stroke-width": "2"};
            var attrLine = {"stroke": colorBlue1, "stroke-width": "2", "arrow-end": "classic"};
            var attrNumber = {"font-size": fontSize, "font-family": 'Verdana'};
            var attrSum = {"font-size": fontSize, "font-family": 'Verdana', "stroke": colorBlue2, "fill": colorBlue2};

            var paper;
            var squareSet;

            this.createCanvas = function(dom, template, square) {
                N = template.length;
                fullSizeX = (N + 2.5) * cellSize + x0 * 2;
                fullSizeY = (N + 1.5) * cellSize + x0 * 2;
                paper = Raphael(dom, fullSizeX, fullSizeY, 0, 0);
                for (var i = 0; i < N; i++){
                    paper.path(Raphael.format("M{0},{1}V{2}",
                        x0 + cellSize * (i + 1.5),
                        y0,
                        y0 + cellSize * (N + 0.5))).attr(attrLine);
                    paper.path(Raphael.format("M{0},{1}H{2}",
                        x0 + cellSize,
                        y0 + cellSize * (i + 0.5),
                        x0 + cellSize * (N + 1.5))).attr(attrLine);
                }
                paper.path(Raphael.format("M{0},{1}L{2},{3}",
                    x0 + cellSize * (N + 1),
                    y0,
                    x0 + cellSize / 2,
                    y0 + cellSize * (N + 0.5))).attr(attrLine);
                paper.path(Raphael.format("M{0},{1}L{2},{3}",
                    x0 + cellSize,
                    y0,
                    x0 + cellSize * (N + 1.5),
                    y0 + cellSize * (N + 0.5))).attr(attrLine);
                for (i = 0; i < N; i++){
                    for (var j = 0; j < N; j++){
                        paper.rect(
                            x0 + j * cellSize + cellSize,
                            y0 + i * cellSize,
                            cellSize,
                            cellSize
                        ).attr(attrSquare);
                        var ts = cellSize * 0.9 / (1 + (String(square[i][j]).length - 1) * 0.5);
                        var t = paper.text(
                            x0 + (j + 1.5) * cellSize,
                            y0 + i * cellSize + cellSize / 2,
                            square[i][j]
                        ).attr(attrNumber).attr("font-size", ts);
                        if (template[i][j] === 0) {
                            t.attr({"stroke": colorBlue3, "fill": colorBlue3});
                        }
                        else if (template[i][j] !== 0 && template[i][j] === square[i][j]) {
                            t.attr({"stroke": colorBlue4, "fill": colorBlue4});
                        }
                        else {
                            t.attr({"stroke": colorOrange3, "fill": colorOrange3});
                        }
                    }
                }
                var fs;
                var sumDiagMain = 0;
                var sumDiagRev = 0;
                for (i = 0; i < N; i++) {
                    var sumRow = 0;
                    var sumCol = 0;
                    for (j = 0; j < N; j++) {
                        sumRow += square[i][j];
                        sumCol += square[j][i];
                    }
                    sumDiagMain += square[i][i];
                    sumDiagRev += square[i][N - i -1];

                    fs = cellSize * 0.6 / (String(sumRow).length - 1);
                    paper.text(x0 + cellSize * (N + 2), y0 + cellSize * (i + 0.5), sumRow).attr(attrSum).attr("font-size", fs);
                    fs = cellSize * 0.6 / (String(sumCol).length - 1);
                    paper.text(x0 + cellSize * (i + 1.5), y0 + cellSize * (N + 1), sumCol).attr(attrSum).attr("font-size", fs);
                }
                fs = cellSize * 0.6 / (String(sumDiagMain).length - 1);
                paper.text(x0 + cellSize * (N + 2), y0 + cellSize * (N + 1), sumDiagMain).attr(attrSum).attr("font-size", fs);
                fs = cellSize * 0.6 / (String(sumDiagRev).length - 1);
                paper.text(x0 + cellSize / 2, y0 + cellSize * (N + 1), sumDiagRev).attr(attrSum).attr("font-size", fs);
            };
        }


    }
);
