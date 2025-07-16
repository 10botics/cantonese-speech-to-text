#!/usr/bin/env node

import { fal } from '@fal-ai/client';

// Configure API key
const API_KEY = '2349dc38-85b4-4494-a360-e7e03c21b16f:aaf08fef42a4362c6cc03bb0a4b10b74';
fal.config({
  credentials: API_KEY
});

// Test case data from the provided file
const testTranscript = `Speaker 1: 二项八其他事项，请问有没有议员要抬出？好，啊，谢谢。啊，袁希文议员。

Speaker 2: 嗯高主席，诶那么找大家很-很快几分钟时间，怎么呢？就是有关那个高空杂物给情况呢？咱们其实呢，就是在上一次我们，呃，11月开会的时候，正正呢，就在那个市区的门口呢，就发生了一个高空杂物伤人事件呢，就是伤到-就刚刚在门口呢帮手，呃，会倒，接着做一些工作这个义工什么的，令到他头部受伤，跟我翻查翻呢，其实防署的数字呢，其实年呢，给监控高空杂物的数字只有一百三十二宗，一年一百零三宗，那么其中也都看过那些数字，三年加起来四百五十宗，我想这也是我的估计，其实同一年都百几宗啊，那么其实也都是呢。就是在这个时候我就见到，呃，在当时的时任的罗区长呢，就有讲过，因为防区呢，就有一个社会先用人工智能的 CCTV，可以看可不可以追踪到高空杂物的平常怎么样？那么我想高空杂物是什么，还是我们这个村呢？ 甚至是整个香港，甚至于是在观塘，我们都知道大家都很关注。那么我现在就想问下防区的同时，有没有一个数字呢，就是现在来可以都，之后会不会回复给我们听？譬如现在说那种新式的人工智能的呃，监控系统究竟是有多少了？怎么样？然后在观塘有几多做啦？那会不会其实来可以给个成效我们去看一下？而且有没有那个数字怎么样？感谢。

Speaker 1: 好，感谢袁希文议员，啊，防区啊，林位主经理，啊，总经理，可以回复一下吗？对啊。

Speaker 3: 啊，前处长说的那个 AI 人工智能呢，其实是呃，我们要装了一部呃，监控系统这里，录影了，最后我们给 AI 去分析的，那就是说如果我们有装到那个天眼系统这里呢，基本上如果我们真的可以知道那个时间的话，我们可以拿这个片过去给 AI 公司去做事的。那现在在观塘区呢，我印象呢，和记录呢，就是所有的公共屋邨呢，都已经有那个高空那个杂物那个监控系统了。不过呢就因为有些邨呢，有多过一个黑点呢，那么就有机会，呃，就是会有些邨有多了，有些邨就起码有一头啦怎么样。那么有机会，即是我们是会丢失的，永远会丢失的，就不会装死某一个位置，所以都是说基本上是每个邨有一个。那么我现在这里呢，过去那个十二个月在东九龙呢，有三十宗个案呢，是扣了七分的，有三个单位呢，就被扣十五分。而运康村呢，只因为有一个跌通口水呢，就发出了清拆通知书给他们。那这几个数字都反映了，其实我们也就是有效地在执行屋邨管理计分制啊。那你说再具体这些数字，可能我再书面回复好，谢谢。

Speaker 1: 好，谢谢啊，林区经理。想看一下警察呃，两个警区的指挥官Madam有没有补充？不该。

Speaker 4: 是，多谢主席。感谢，也多谢梁议员的提问呢。其实这些高空杂物的事件呢，我们也是很紧张，因为这些会伤到街坊嘛，然后也对人身是构成伤害的。所以如果我们接到这些 case 呢，其实我们都会翻查闭路电视啊，然后就看看能不能找到那个作凶的是哪一个。然后从而看看我们有刑事的责任啦，同样呢会交给防区，我们会后续有一些去扣分啊，或者是一个惩罚的。那在这一单 case 就有少少，在没有彩色，那个时候还没有 CCTV，那所以那里面追寻那边呢，是会有点困难，对了，所以如果任何地方还有这个呃，监控的话，那我们一定会追究到底的。好，谢谢主席。

Speaker 2: 嘿，观塘警区没有补充啊！多谢主席。

Speaker 1: 好，感谢！那梁议员有没有补充？OK 好好，那谢谢，感谢梁议员提一抬这个高空杂物的情况，好，那就大家有没有其他其他事项？ OK，没有。`;

// Raw participant list from the test case (觀塘民政事務處會議室)
const testParticipants = `觀塘民政事務處會議室
主 席
何立基先生 , J P
議 員
余邵倫 先 生 連浩民先生 , M H
余嘉明先生 陳耀雄先生 , M H
吳承華先生 曾榮輝先生
吳庭鋒先生 程海欣女士
呂東孩先生 , M H 馮韻斯女士
李淑媛 女 士 黃春平先生 , M H , J P
李嘉恒先生 黃啟燊先生
房逸君先生 楊莉瑤女士
林峰先生 , M H 詹寶瑜女士
林瑋先生 劉嘉華先生
金堅女士 歐陽均諾先生
柯創盛先生 , M H 諸樂為女士
洪錦鉉先生 , M H 鄧咏駿先生
馬軼超先生 , M H 鄭強峰先生
張姚彬先生 賴永春先生 , M H
張培剛先生 簡銘東先生 , M H
張琪騰先生 , M H 譚肇卓先生
梁思韻女士 關堅榮先生
符碧珍女士 , M H 龐智笙先生
許有為先生



列席者
陳慧珍女士 觀塘民政事務助理專員 (1 )
張家朗先生 觀塘民政事務助理專員 (2 )
錢曾璐總 警 司 警務處觀塘警區指揮官
謝翠恩總警司 警務處秀茂坪警區指揮官
林秀華女士 警務處觀塘警區警民關係主任
譚文海先生 警務處秀茂坪警區警民關係主任
李銘強先生 土木工程拓展署 總 工程師 /東 2
凌 煒 傑先生 房屋署 物業管理總經理 (東九龍 )
廖健威先生 運輸署 總運輸主任 /九 龍 2
羅潔娜女士 食物環境衞生署觀塘區環境衞生總監
梁保華先生 社會福利署觀塘區福利專員
張綺美女士 康樂及文化事務署總康樂事務經理 (九 龍 )
吳見青女士 康樂及文化事務署觀塘區康樂事務經理
蕭琇瓊女士 康樂及文化事務署觀塘區副康樂事務經理 (分區支援 )
周德心女士 觀塘民政事務處高級行政主任 (地區管理 )
馮志文先生 觀塘民政事務處高級聯絡主任 (1 )
易慧思女士 觀塘民政事務處高級聯絡主任 (2 )
鄧俊明先生 觀塘民政事務處 高 級 聯絡主任 (3 )
葉玉薇女士 觀塘民政事務處 高 級 聯絡主任 (4 )
許寶如女士 觀塘民政事務處一級行政主任 (區議會 )`;

async function testSpeakerIdentification() {
  console.log('🧪 Testing Speaker Identification with DeepSeek R1');
  console.log('=====================================\n');
  
  console.log('📝 Test Case: Hong Kong Kwun Tong District Council Meeting');
  console.log('🗣️ Total Participants Available: Raw participant list from test case');
  console.log('📊 Speakers in transcript: 4 (Speaker 1-4)\n');

  try {
    const startTime = Date.now();
    
    console.log('🚀 Calling Fal.ai Any LLM API with DeepSeek R1...');
    
    const result = await fal.subscribe('fal-ai/any-llm', {
      input: {
        model: "deepseek/deepseek-r1",
                system_prompt: "You are a meeting analysis expert. Respond with only valid JSON. Do not include any explanations or additional text.",
        prompt: `You are analyzing a meeting transcript to identify speakers based on their roles and topics they discuss.

Participant List:
${testParticipants}

Meeting Transcript:
${testTranscript}

Please match each speaker to a participant based on:
- Their role in the meeting (chairperson, questioner, responder)  
- The topics they discuss (housing, police, general council matters)
- Their speaking patterns and authority level

Return only valid JSON with speaker mappings. Use "Unknown" if unsure.
Format: {"Speaker 1": "name", "Speaker 2": "name", "Speaker 3": "name", "Speaker 4": "name"}`
      },
      logs: true,
              onQueueUpdate: (update) => {
          if (update.status === 'IN_PROGRESS') {
            console.log('🔄 DeepSeek R1 is analyzing the conversation...');
          }
        }
    });

    const processingTime = Date.now() - startTime;
    console.log(`⚡ API call completed in ${processingTime}ms\n`);

    console.log('📨 Raw DeepSeek R1 Response:');
    console.log('------------------------');
    console.log(result.data.output);
    console.log('------------------------\n');

    // Test JSON parsing
    console.log('🧪 Testing JSON parsing...');
    let speakerMappings;
    
    try {
      const geminiResponse = result.data.output.trim();
      
      // Try to extract JSON from response
      const jsonMatch = geminiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        speakerMappings = JSON.parse(jsonMatch[0]);
        console.log('✅ JSON parsing successful!');
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (parseError) {
      console.log('❌ JSON parsing failed:', parseError.message);
      console.log('🔄 Using fallback assignment...');
      
      // Fallback
      speakerMappings = {
        "Speaker 1": "Unknown",
        "Speaker 2": "Unknown",
        "Speaker 3": "Unknown",
        "Speaker 4": "Unknown"
      };
    }

    console.log('\n🎯 Final Speaker Mappings:');
    console.log('=========================');
    Object.entries(speakerMappings).forEach(([speaker, name]) => {
      const status = name === "Unknown" ? "❓" : "✅";
      console.log(`${status} ${speaker}: ${name}`);
    });

    // Basic validation
    console.log('\n🔍 Validation Results:');
    console.log('======================');
    
    let validMappings = 0;
    let totalSpeakers = Object.keys(speakerMappings).length;

    Object.entries(speakerMappings).forEach(([speaker, name]) => {
      if (name === "Unknown") {
        console.log(`✅ ${speaker}: ${name} (acceptable)`);
        validMappings++;
      } else if (testParticipants.includes(name)) {
        console.log(`✅ ${speaker}: ${name} (valid participant)`);
        validMappings++;
      } else {
        console.log(`❌ ${speaker}: ${name} (not in participant list)`);
      }
    });

    const validationRate = (validMappings / totalSpeakers * 100).toFixed(1);
    console.log(`\n📊 Validation: ${validMappings}/${totalSpeakers} valid mappings (${validationRate}%)`);

    // Test performance
    console.log('\n⚡ Performance Metrics:');
    console.log('======================');
    console.log(`Processing Time: ${processingTime}ms`);
    console.log(`Characters Analyzed: ${testTranscript.length}`);
    console.log(`Processing Speed: ${(testTranscript.length / processingTime * 1000).toFixed(0)} chars/sec`);

    console.log('\n🎉 Test completed successfully!');
    return true;

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('Error status:', error.status);
    if (error.body && error.body.detail) {
      console.error('Error details:', JSON.stringify(error.body.detail, null, 2));
    }
    console.error('Full error:', error);
    return false;
  }
}

// Run the test
console.log('Starting Speaker Identification Test...\n');
testSpeakerIdentification()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  }); 