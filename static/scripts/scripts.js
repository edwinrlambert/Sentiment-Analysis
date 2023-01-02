$(document).ready(function () {

    // Default to Text Input.
    $("#div-textarea").show();
    $("#div-input").hide();
    $("#div-media").hide();

    // Show and Hide DIVs based on button click.
    $("#btn-prompt-text").click(() => {
        $("#div-textarea").show();
        $("#div-input").hide();
        $("#div-media").hide();
    });
    $("#btn-prompt-url").click(() => {
        $("#div-textarea").hide();
        $("#div-input").show();
        $("#div-media").hide();
    });
    $("#btn-prompt-media").click(() => {
        $("#div-textarea").hide();
        $("#div-input").hide();
        $("#div-media").show();
    });

    // Form Submit and Show Overlay
    $("#btn-find-sentiment").click((e) => {
        e.preventDefault();
        let input = ""
        if ($("#div-textarea").is(":visible")) {
            input = $("#form-input-textarea").val();
            type = "text";
        } else if ($("#div-input").is(":visible")) {
            input = $("#form-input-url").val();
            type = "url";
        } else if ($("#div-media").is(":visible")) {
            input = $("#form-input-media").val();
            type = "media";
        }

        if (input != "") {
            $("#overlay").css("display", "block");
            $.ajax({
                type: 'POST',
                url: '/',
                data: JSON.stringify({
                    "input": input,
                    "type": type
                }),
                dataType: 'json',
                contentType: 'application/json'
            })
                .done((response) => {
                    console.log(response)
                    val_neg = Math.round(parseFloat(response["score_negative"]) * 10000) / 100
                    val_neu = Math.round(parseFloat(response["score_neutral"]) * 10000) / 100
                    val_pos = Math.round(parseFloat(response["score_positive"]) * 10000) / 100

                    $("#overlay-content").html(`
                        <h2>PROMINENT SENTIMENT</h2>
                        <p id="prominent-sentiment">` + response["prominent_sentiment"] + `</p>
                        <div id="sentiment-info">
                            <div id="sentiment-table">
                                <table class="table">
                                    <thead class="thread-dark">
                                        <th scope="col"></th>
                                        <th scope="col">Sentiment</th>
                                        <th scope="col">Value</th>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>&#128543;</td>
                                            <td>Negative</td>
                                            <td>` + val_neg + `%</td>
                                        </tr>
                                        <tr>
                                            <td>&#128528;</td>
                                            <td>Neutral</td>
                                            <td>` + val_neu + `%</td>
                                        </tr>
                                        <tr>
                                            <td>&#128512;</td>
                                            <td>Positive</td>
                                            <td>` + val_pos + `%</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <canvas id="sentiment-radar-chart"></canvas>
                        </div>
                    `)

                    const chart = $("#sentiment-radar-chart")
                    new Chart(chart, {
                        type: 'radar',
                        data: {
                            labels: ['Negative', 'Neutral', 'Positive'],
                            datasets: [{
                                label: 'Sentiment',
                                data: [val_neg, val_neu, val_pos],
                                fill: true,
                                color: '#FFF',
                                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                                borderColor: 'rgb(255, 99, 132)',
                                pointBackgroundColor: '#FFF',
                                pointBorderColor: '#FFF',
                                pointHoverBackgroundColor: '#FFF',
                                pointHoverBorderColor: '#FFF'
                            }]
                        },
                        options: {
                            elements: {
                                line: {
                                    borderWidth: 5
                                },
                                legend: {
                                    labels: {
                                        color: 'rgb(255, 255, 255)',
                                        fontSize: 18
                                    }
                                }
                            },
                            scales: {
                                r: {
                                    angleLines: {
                                        color: 'rgba(255, 255, 255, 0.5)',
                                    },
                                    grid: {
                                        color: 'rgba(255, 255, 255, 0.5)',
                                    },
                                    pointLabels: {
                                        color: 'rgb(255, 255, 255)',
                                        fontSize: 20
                                    },
                                    ticks: {
                                        color: 'rgb(0, 0, 0)'
                                    }
                                }
                            }
                        },
                    });

                })
                .fail((err) => {
                    console.log(err)
                })
        }
    })

    // Remove Overlay
    $("#overlay").click(() => {
        $("#overlay").css("display", "none");
        $("#form-input-textarea").val("");
        $("#form-input-url").val("");
        $("#form-input-media").val("");
        window.location.reload();
    })

})