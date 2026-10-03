$path = Join-Path $PSScriptRoot "js\data.js"
$raw = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

$characters = @(
    @{ code = '1w9'; name = '모세 (Moses)'; title = '이상주의와 온유함의 지도자'; img = 'images/character_moses.png'; quote = '여호와께서 모세와 면대하여 말씀하시듯... (출애굽기 33:11)'; desc = '1w9 유형은 올곧은 윤리와 높은 이상을 품으면서도 온유함으로 공동체를 보듬은 모세 선지자의 성품과 닮아 있습니다.' },
    @{ code = '1w2'; name = '세례 요한 (John the Baptist)'; title = '의를 위해 외치는 광야의 선지자'; img = 'images/character_john_baptist.png'; quote = '너희는 주의 길을 준비하라 (마가복음 1:3)'; desc = '1w2 유형은 강렬한 의로움과 이웃을 바른 길로 이끄는 열정적인 헌신을 겸비한 세례 요한과 닮았습니다.' },
    @{ code = '2w1'; name = '마르다 (Martha)'; title = '성실과 헌신의 사랑 봉사자'; img = 'images/character_martha.png'; quote = '주여 내 동생이 나 혼자 일하게 두는 것을 생각하지 아니하시나이까 (누가복음 10:40)'; desc = '2w1 유형은 따뜻한 사랑에 묵묵한 도덕적 성실함을 더해 주님과 이웃을 섬기는 마르다의 모습입니다.' },
    @{ code = '2w3'; name = '에스더 왕후 (Queen Esther)'; title = '사랑과 담대한 리더십의 왕후'; img = 'images/character_esther.png'; quote = '죽으면 죽으리이다 (에스더 4:16)'; desc = '2w3 유형은 이타적인 사랑과 사람들의 마음을 움직이는 매력으로 민족을 구해낸 에스더 왕후의 성품입니다.' },
    @{ code = '3w2'; name = '요셉 총리 (Joseph)'; title = '탁월함과 지혜로 사람을 살린 총리'; img = 'images/character_joseph.png'; quote = '하나님이 생명을 구원하시려고 나를 당신들보다 먼저 보내셨나이다 (창세기 45:5)'; desc = '3w2 유형은 뛰어난 역량과 따뜻한 영향력으로 사람들을 이롭게 한 요셉 총리와 닮아 있습니다.' },
    @{ code = '3w4'; name = '솔로몬 왕 (King Solomon)'; title = '독창적 지혜와 성취의 지혜 왕'; img = 'images/character_solomon.svg'; quote = '듣는 마음을 종에게 주사 선악을 분별하게 하소서 (열왕기상 3:9)'; desc = '3w4 유형은 탁월한 능력과 유일무이한 깊은 통찰력으로 명성을 떨친 솔로몬 왕의 성품입니다.' },
    @{ code = '4w3'; name = '다윗 왕 (King David)'; title = '깊은 감성과 찬양의 영혼 시인'; img = 'images/character_david.svg'; quote = '여호와는 나의 목자시니 내게 부족함이 없으리로다 (시편 23:1)'; desc = '4w3 유형은 가슴 깊은 감정을 영성으로 승화시키며 하나님의 마음에 합했던 다윗 왕의 모습입니다.' },
    @{ code = '4w5'; name = '예레미야 (Jeremiah)'; title = '눈물과 영적 통찰의 묵상가'; img = 'images/character_jeremiah.svg'; quote = '내 눈이 눈물에 창일하며 내 마음이 저리니 (예레미야애가 2:11)'; desc = '4w5 유형은 시대를 향한 안타까움과 깊은 내면의 진정성을 묵상으로 담아낸 예레미야 선지자와 닮았습니다.' },
    @{ code = '5w4'; name = '사도 요한 (John the Apostle)'; title = '영적 신비와 지혜 탐구의 사도'; img = 'images/character_apostle_john.svg'; quote = '태초에 말씀이 계시니라 이 말씀이 하나님과 함께 계셨으니 (요한복음 1:1)'; desc = '5w4 유형은 하나님의 신비로운 진리와 사랑을 깊고 독창적인 혜안으로 기록한 사도 요한의 성품입니다.' },
    @{ code = '5w6'; name = '학자 에스라 (Ezra)'; title = '진리를 연구하고 수호하는 학자'; img = 'images/character_ezra.png'; quote = '에스라가 율법을 연구하여 가르치기로 결심하였었더라 (에스라 7:10)'; desc = '5w6 유형은 신중한 지식과 철저한 신뢰성을 바탕으로 공동체의 진리를 지켜낸 에스라 학자입니다.' },
    @{ code = '6w5'; name = '느헤미야 (Nehemiah)'; title = '성벽을 재건하는 신실한 수호자'; img = 'images/character_nehemiah.svg'; quote = '우리 하나님이 우리를 위하여 싸우시리라 (느헤미야 4:20)'; desc = '6w5 유형은 철저한 준비와 신중한 분석으로 불가능해 보이던 성벽을 재건한 느헤미야 총독입니다.' },
    @{ code = '6w7'; name = '룻 (Ruth)'; title = '신실하고 따뜻한 희망의 동반자'; img = 'images/character_ruth.svg'; quote = '어머니의 백성이 나의 백성이 되고... (룻기 1:16)'; desc = '6w7 유형은 변함없는 충성과 따뜻한 유대감으로 소망을 피워낸 룻의 아름다운 성품입니다.' },
    @{ code = '7w6'; name = '미리암 (Miriam)'; title = '기쁨의 소고로 찬양한 예언자'; img = 'images/character_miriam.svg'; quote = '너희는 여호와를 찬송하라 그는 높고 영화로우심이요 (출애굽기 15:21)'; desc = '7w6 유형은 밝고 유쾌한 에너지로 사람들에게 소망을 전달하며 승리를 노래한 미리암 선지자입니다.' },
    @{ code = '7w8'; name = '사도 베드로 (Simon Peter)'; title = '열정과 담대함의 불꽃 제자'; img = 'images/character_peter.svg'; quote = '주는 그리스도시요 살아계신 하나님의 아들이시니이다 (마태복음 16:16)'; desc = '7w8 유형은 거침없는 열정과 주도적인 추진력으로 주님의 사명을 향해 달려간 베드로 사도와 닮았습니다.' },
    @{ code = '8w7'; name = '엘리야 (Elijah)'; title = '갈멜산의 담대한 불꽃 도전자'; img = 'images/character_elijah.svg'; quote = '여호와여 내게 응답하옵소서 내게 응답하옵소서 (열왕기상 18:37)'; desc = '8w7 유형은 어떠한 위협에도 타협하지 않고 하나님의 정의를 불같이 선포한 엘리야 선지자입니다.' },
    @{ code = '8w9'; name = '보아스 (Boaz)'; title = '약자의 든든한 울타리와 유력자'; img = 'images/character_boaz.svg'; quote = '여호와께서 네가 행한 일에 보답하시며 완전한 상 주시기를 원하노라 (룻기 2:12)'; desc = '8w9 유형은 바위 같은 단단함과 너그러운 평화로 약자를 보호하고 살리는 보아스의 성품입니다.' },
    @{ code = '9w8'; name = '아브라함 (Abraham)'; title = '평화와 순종의 믿음 조상'; img = 'images/character_abraham.svg'; quote = '우리는 한 친족이라 나나 너나 서로 다투게 하지 말자 (창세기 13:8)'; desc = '9w8 유형은 갈등을 피하고 평화를 실천하면서도 위기 앞에서는 담대히 이끈 믿음의 아브라함입니다.' },
    @{ code = '9w1'; name = '이삭 (Isaac)'; title = '우물을 양보하고 온유함을 지킨 사람'; img = 'images/character_isaac.svg'; quote = '이삭이 다른 우물을 팠더니 그들이 다투지 아니하였으므로 (창세기 26:22)'; desc = '9w1 유형은 다툼을 양보로 다스리고 내면의 단정함과 조화를 끝까지 유지한 평화주의자 이삭입니다.' }
)

foreach ($c in $characters) {
    $target = '"' + $c.code + '": {'
    $idx = $raw.IndexOf($target)
    if ($idx -ge 0) {
        $sumIdx = $raw.IndexOf('summary:', $idx)
        if ($sumIdx -ge 0) {
            $endLine = $raw.IndexOf("`n", $sumIdx)
            $charBlock = "`r`n    character: {`r`n      name: `"$($c.name)`",`r`n      title: `"$($c.title)`",`r`n      image: `"$($c.img)`",`r`n      quote: `"$($c.quote)`",`r`n      description: `"$($c.desc)`"`r`n    },"
            $raw = $raw.Insert($endLine, $charBlock)
        }
    }
}

[System.IO.File]::WriteAllText($path, $raw, [System.Text.Encoding]::UTF8)
Write-Host "Updated data.js cleanly!"
