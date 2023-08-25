var express = require('express');
var bodyParser = require('body-parser');
var urlencodeParser = bodyParser.urlencoded({ extended: false });
var validator = require('express-validator');
const Transaction = require('../../models/transactions');
const QueryTypes=require('sequelize')
const Api = require('../../models/api');
const {Sequelize,Op} = require('sequelize')
const sequelize=require('../../database/connection');
const api_names = require('../../models/api');
const axios=require('axios')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../../models/user')

require('dotenv').config()





module.exports = function (app) {

      function isUserAllowed(req, res, next) {
            sess = req.session;
            if (sess.user) {
                  return next();
            }
            else { res.redirect('/login'); }
      }
      // async function retrieveTransactions() {
      //       try {
      //         const transactions = await Transaction.findAll({
      //           attributes: ['id', 'price', 'type', 'credit_debit', 'narration', 'account_type', 'transaction_time'],
      //         });
          
      //         res.render('Dashboard/index', {attributes: attributes})
      //       } catch (error) {
      //         console.error('Error retrieving transactions:', error);
      //       }
      //     }

      // app.get('/',(req,res)=>{
      //       res.locals={title:'Dashboard One'}
      //       res.render('Dashboard/index')
      // })


      app.get('/', isUserAllowed, async (req, res) => {
            res.locals = { title: 'Dashboard One' };
            
            //   res.render('./Dashboard/index', { transactions: transactions.rows, totalCount, totalPages, currentPage: page });
            res.render('./Dashboard/index')
          });
      
          const { Sequelize } = require('sequelize');

          // ...
          app.get('/dashboard',(req,res)=>{
      
            res.render('./Dashboard/index')
          })

          async function checkSuperadminRole(req, res, next) {
		const ne5_member_id = req.body.ne5_member_id;
		console.log(ne5_member_id)
	  
		try {
		  // Fetch the user's role from the database
		  const sqlQuery = `
			SELECT role,id
			FROM api_users
			WHERE ne5_member_id = :ne5_member_id
			LIMIT 1;
		  `;
			
		  const [user, _] = await sequelize.query(sqlQuery, {
			replacements: { ne5_member_id: ne5_member_id },
			type: Sequelize.QueryTypes.SELECT,
		  });
		  console.log(user)
	  
		  // If the user exists in the database and has a role property
		 
		  if ( user) {
			// Get the user's role
			console.log("Inside if")
			const role = user.role;
			const userId = user.user_id;
			
	  
			// Check if the role is "admin"
			if (role === "Admin") {
				// Role is superadmin, allow access to all routes
				req.isAdmin = true; // Set a flag to indicate the user is an admin
				req.isSuperAdmin = true;
				 // Set a flag to indicate the user is a superadmin
				next();
			  } else  {
				// Role is neither admin nor superadmin, return error as Forbidden
				res.status(403).json({ error: "Forbidden - Superadmin role required" });
			  }
			} else {
			  // User not found in the database or doesn't have a role, return error as Forbidden
			  res.status(403).json({ error: "Forbidden - Superadmin role required" });
			}
		  } catch (err) {
			// Handle any errors that may occur during the database query
			console.error("Error checking user role:", err);
			// You can choose to respond with an error or redirect the user to an error page
			res.status(500).json({ error: "Internal Server Error" });
		  }
		}
		function isAdmin(req, res, next) {
			if (req.userRole === 'Admin') {
			  next();
			} else {
			  res.status(403).json({ error: 'Forbidden - Admin role required' });
			}
		  }
          app.post('/post-login', urlencodeParser,checkSuperadminRole,async function (req, res) {
		const ne5_member_id=req.body.ne5_member_id
		const password=req.body.password
		const sqlQuery = `
		SELECT * 
		FROM api_users
		WHERE ne5_member_id = :ne5_member_id
		LIMIT 1;
	  `;

		 const [validUser, _] = await sequelize.query(sqlQuery, {
      replacements: { ne5_member_id: ne5_member_id },
      type: Sequelize.QueryTypes.SELECT,
    });
		if (validUser.password===password) {

			// Assign value in session
			req.session.validUser=validUser
			res.redirect('/')
		} else {
			req.flash('error', 'Incorrect email or password!');
			res.redirect('/login',{'login':validUser,
		'message':'Could not authenticate with given details','active':validUser});
		}
	});

          
          
          
          
          
          app.get('/custom-query', async (req, res) => {
            try {
              const page = parseInt(req.query.page) || 1;
              const limit = 10;
              const offset = (page - 1) * limit;
              const apiName = req.query.apiName;
              const fromDate = req.query.fromDate;
              const toDate = req.query.toDate;
          
              let query = `
                SELECT transactions.transaction_id, transactions.price, transactions.type,
                  transactions.credit_debit, transactions.narration, transactions.account_type, transactions.transaction_time,
                  transactions.api_id, api_names.api_name
                FROM transactions
                JOIN api_names ON transactions.api_id = api_names.id
              `;
          
              let countQuery = `
                SELECT COUNT(*) AS totalRecords
                FROM transactions
                JOIN api_names ON transactions.api_id = api_names.id
              `;
          
              const replacements = {};
              if (apiName || fromDate || toDate) {
                query += `
                  WHERE 1=1
                `;
                countQuery += `
                  WHERE 1=1
                `;
                if (apiName) {
                  query += ` AND api_names.api_name = :apiName`;
                  countQuery += ` AND api_names.api_name = :apiName`;
                  replacements.apiName = apiName;
                }
                if (fromDate) {
                  query += ` AND transactions.transaction_time >= :fromDate`;
                  countQuery += ` AND transactions.transaction_time >= :fromDate`;
                  replacements.fromDate = fromDate;
                }
                if (toDate) {
                  query += ` AND transactions.transaction_time <= :toDate`;
                  countQuery += ` AND transactions.transaction_time <= :toDate`;
                  replacements.toDate = toDate;
                }
              }
          
              query += `
                ORDER BY transactions.transaction_time DESC
                LIMIT :limit
                OFFSET :offset;
              `;
          
              countQuery += ';';
          
              const [transactions, metadata] = await Promise.all([
                sequelize.query(query, {
                  replacements: { ...replacements, limit, offset },
                  type: Sequelize.QueryTypes.SELECT,
                }),
                sequelize.query(countQuery, {
                  replacements,
                  type: Sequelize.QueryTypes.SELECT,
                }),
              ]);
          
              const count = metadata[0].totalRecords;
              const totalPages = Math.ceil(count / limit);
          
              res.render('./Transactions/transactions', {
                transactions,
                totalPages,
                currentPage: page,
                fromDate: fromDate || null,
                toDate: toDate || null,
                apiName: apiName || '',
              });
            } catch (error) {
              console.error('Error fetching transactions:', error);
              res.status(500).json({ error: 'Internal Server Error' });
            }
          });
          
          
          // Search API
         // Add the following route handler for the search API
app.get('/search', async (req, res) => {
      try {
        const searchKeyword = req.body.searchKeyword;
        console.log(searchKeyword)
    
        // Call the custom-query API to fetch the transactions data
        const response = await axios.get('http://localhost:8000/custom-query', {
          params: req.query
        });
    
        // Get the transactions data from the API response
        const transactions = response.data.transactions;
    
        // Filter the transactions based on the search keyword
        const filteredTransactions = transactions.filter((transaction) => {
          // Modify the condition based on your search criteria
          return (
            transaction.transaction_id.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            transaction.narration.toLowerCase().includes(searchKeyword.toLowerCase())
          );
        });
    
        // Render the EJS template with the filtered transactions data
        res.render('search', {
          transactions: filteredTransactions,
          searchKeyword: searchKeyword
        });
      } catch (error) {
        console.error('Error searching transactions:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
    
          
          
        
          
        
      app.get('/index-2', isUserAllowed, function (req, res) {
            res.locals = { title: 'Dashboard Two' };
            res.render('Dashboard/index-2');
      });



      // Layouts
      
      app.get('/layouts-compact-sidebar', isUserAllowed, function (req, res) {
            res.locals = { title: 'Compact Sidebar' };
            res.render('Dashboard/index', { layout: 'layoutsCompactSidebar' });
      });
      app.get('/layouts-icon-sidebar', isUserAllowed, function (req, res) {
            res.locals = { title: 'Icon Sidebar' };
            res.render('Dashboard/index', { layout: 'layoutsIconSidebar' });
      });
      app.get('/layouts-boxed', isUserAllowed, function (req, res) {
            res.locals = { title: 'Boxed Width' };
            res.render('Dashboard/index', { layout: 'layoutsBoxed' });
      });
      app.get('/layouts-preloader', isUserAllowed, function (req, res) {
            res.locals = { title: 'Preloader' };
            res.render('Dashboard/index', { layout: 'layoutsPreloader' });
      });
      
      

      app.get('/layouts-horizontal', isUserAllowed, function (req, res) {
            res.locals = { title: 'Horizontal' };
            res.render('Dashboard/index', { layout: 'layoutsHorizontal' });
      });
      app.get('/layouts-hori-topbarlight', isUserAllowed, function (req, res) {
            res.locals = { title: 'Topbar Dark' };
            res.render('Dashboard/index', { layout: 'layoutsHTopbarLight' });
      });
      app.get('/layouts-hori-boxed', isUserAllowed, function (req, res) {
            res.locals = { title: 'Boxed Width' };
            res.render('Dashboard/index', { layout: 'layoutsHBoxed' });
      });
      app.get('/layouts-hori-preloader', isUserAllowed, function (req, res) {
            res.locals = { title: 'Preloader' };
            res.render('Dashboard/index', { layout: 'layoutsHPreloader' });
      });
      

      // Color Theme vertical
      app.get("/vertical-dark", isUserAllowed, function (req, res) {
            res.locals = { title: 'Vertical Dark' };
            res.render("Dashboard/index", { layout: "vertical-dark-layout" });
      });
      
      app.get("/vertical-rtl", isUserAllowed, function (req, res) {
            res.locals = { title: 'Vertical Rtl' };
            res.render("Dashboard/index", { layout: "vertical-rtl-layout" });
      });
      
      // Color Theme Horizontal
      app.get("/horizontal-dark", isUserAllowed, function (req, res) {
            res.locals = { title: 'Horizontal Dark' };
            res.render("Dashboard/index", { layout: "horizontal-dark-layout" });
      });
      
      app.get("/horizontal-rtl", isUserAllowed, function (req, res) {
            res.locals = { title: 'Horizontal Rtl' };
            res.render("Dashboard/index", { layout: "horizontal-rtl-layout" });
      });

      // Calendar
      app.get('/calendar', isUserAllowed, function (req, res) {
            res.locals = { title: 'Calendar' };
            res.render('Calendar/calendar');
      });

      // Email
      app.get('/email-inbox', isUserAllowed, function (req, res) {
            res.locals = { title: 'Inbox' };
            res.render('Email/email-inbox');
      });
      app.get('/email-read', isUserAllowed, function (req, res) {
            res.locals = { title: 'Email Read' };
            res.render('Email/email-read');
      });

      // Tasks
      app.get('/tasks-list', isUserAllowed, function (req, res) {
            res.locals = { title: 'Task List' };
            res.render('Tasks/tasks-list');
      });
      app.get('/tasks-kanban', isUserAllowed, function (req, res) {
            res.locals = { title: 'Kanban Board' };
            res.render('Tasks/tasks-kanban');
      });
      app.get('/tasks-create', isUserAllowed, function (req, res) {
            res.locals = { title: 'Create Task' };
            res.render('Tasks/tasks-create');
      });


      // Pages
      app.get('/pages-starter', isUserAllowed, function (req, res) {
            res.locals = { title: 'Starter Page' };
            res.render('Pages/pages-starter');
      });
      app.get('/pages-invoice', isUserAllowed, function (req, res) {
            res.locals = { title: 'Invoice' };
            res.render('Pages/pages-invoice');
      });
      app.get('/pages-profile', isUserAllowed, function (req, res) {
            res.locals = { title: 'Profile' };
            res.render('Pages/pages-profile');
      });
      app.get('/pages-timeline', isUserAllowed, function (req, res) {
            res.locals = { title: 'Timeline' };
            res.render('Pages/pages-timeline');
      });
      app.get('/pages-faqs', isUserAllowed, function (req, res) {
            res.locals = { title: 'FAQs' };
            res.render('Pages/pages-faqs');
      });
      app.get('/pages-pricing', isUserAllowed, function (req, res) {
            res.locals = { title: 'Pricing' };
            res.render('Pages/pages-pricing');
      });

      // UI
      app.get('/ui-alerts', isUserAllowed, function (req, res) {
            res.locals = { title: 'Alerts' };
            res.render('Ui/ui-alerts');
      });
      app.get('/ui-buttons', isUserAllowed, function (req, res) {
            res.locals = { title: 'Buttons' };
            res.render('Ui/ui-buttons');
      });
      app.get('/ui-cards', isUserAllowed, function (req, res) {
            res.locals = { title: 'Cards' };
            res.render('Ui/ui-cards');
      });
      app.get('/ui-carousel', isUserAllowed, function (req, res) {
            res.locals = { title: 'Carousel' };
            res.render('Ui/ui-carousel');
      });
      app.get('/ui-dropdowns', isUserAllowed, function (req, res) {
            res.locals = { title: 'Dropdowns' };
            res.render('Ui/ui-dropdowns');
      });
      app.get('/ui-grid', isUserAllowed, function (req, res) {
            res.locals = { title: 'Grid' };
            res.render('Ui/ui-grid');
      });
      app.get('/ui-images', isUserAllowed, function (req, res) {
            res.locals = { title: 'Images' };
            res.render('Ui/ui-images');
      });
      app.get('/ui-lightbox', isUserAllowed, function (req, res) {
            res.locals = { title: 'Lightbox' };
            res.render('Ui/ui-lightbox');
      });
      app.get('/ui-modals', isUserAllowed, function (req, res) {
            res.locals = { title: 'Modals' };
            res.render('Ui/ui-modals');
      });
      app.get('/ui-rangeslider', isUserAllowed, function (req, res) {
            res.locals = { title: 'Range Slider' };
            res.render('Ui/ui-rangeslider');
      });
      app.get('/ui-session-timeout', isUserAllowed, function (req, res) {
            res.locals = { title: 'Session Timeout' };
            res.render('Ui/ui-session-timeout');
      });
      app.get('/ui-progressbars', isUserAllowed, function (req, res) {
            res.locals = { title: 'Progress Bars' };
            res.render('Ui/ui-progressbars');
      });
      app.get('/ui-sweet-alert', isUserAllowed, function (req, res) {
            res.locals = { title: 'Sweet Alert' };
            res.render('Ui/ui-sweet-alert');
      });
      app.get('/ui-tabs-accordions', isUserAllowed, function (req, res) {
            res.locals = { title: 'Tabs & Accordions' };
            res.render('Ui/ui-tabs-accordions');
      });
      app.get('/ui-typography', isUserAllowed, function (req, res) {
            res.locals = { title: 'Typography' };
            res.render('Ui/ui-typography');
      });
      app.get('/ui-video', isUserAllowed, function (req, res) {
            res.locals = { title: 'Video' };
            res.render('Ui/ui-video');
      });
      app.get('/ui-general', isUserAllowed, function (req, res) {
            res.locals = { title: 'General' };
            res.render('Ui/ui-general');
      });
      
      
      app.get('/ui-colors', isUserAllowed, function (req, res) {
            res.locals = { title: 'Colors' };
            res.render('Ui/ui-colors');
      });
      app.get('/ui-rating', isUserAllowed, function (req, res) {
            res.locals = { title: 'Rating' };
            res.render('Ui/ui-rating');
      });
     

      // Forms
      app.get('/form-elements', isUserAllowed, function (req, res) {
            res.locals = { title: 'Form Elements' };
            res.render('Form/form-elements');
      });
      app.get('/form-validation', isUserAllowed, function (req, res) {
            res.locals = { title: 'Form Validation' };
            res.render('Form/form-validation');
      });
      app.get('/form-advanced', isUserAllowed, function (req, res) {
            res.locals = { title: 'Form Advanced' };
            res.render('Form/form-advanced');
      });
      app.get('/form-editors', isUserAllowed, function (req, res) {
            res.locals = { title: 'Form Editors' };
            res.render('Form/form-editors');
      });
      app.get('/form-uploads', isUserAllowed, function (req, res) {
            res.locals = { title: 'Form File Upload' };
            res.render('Form/form-uploads');
      });
      app.get('/form-xeditable', isUserAllowed, function (req, res) {
            res.locals = { title: 'Form Xeditable' };
            res.render('Form/form-xeditable');
      });
      app.get('/form-repeater', isUserAllowed, function (req, res) {
            res.locals = { title: 'Form Repeater' };
            res.render('Form/form-repeater');
      });
      app.get('/form-wizard', isUserAllowed, function (req, res) {
            res.locals = { title: 'Form Wizard' };
            res.render('Form/form-wizard');
      });
      app.get('/form-mask', isUserAllowed, function (req, res) {
            res.locals = { title: 'Form Mask' };
            res.render('Form/form-mask');
      });
     
      // Tables
      app.get('/tables-basic', isUserAllowed, function (req, res) {
            res.locals = { title: 'Basic Tables' };
            res.render('Tables/tables-basic');
      });
      app.get('/tables-datatable', isUserAllowed, function (req, res) {
            res.locals = { title: 'Data Tables' };
            res.render('Tables/tables-datatable');
      });
      app.get('/tables-responsive', isUserAllowed, function (req, res) {
            res.locals = { title: 'Responsive Table' };
            res.render('Tables/tables-responsive');
      });
      app.get('/tables-editable', isUserAllowed, function (req, res) {
            res.locals = { title: 'Editable Table' };
            res.render('Tables/tables-editable');
      });
      
      // Charts
      app.get('/charts-apex', isUserAllowed, function (req, res) {
            res.locals = { title: 'Apex charts' };
            res.render('Charts/charts-apex');
      });
      app.get('/charts-chartjs', isUserAllowed, function (req, res) {
            res.locals = { title: 'Chartjs Chart' };
            res.render('Charts/charts-chartjs');
      });
      app.get('/charts-flot', isUserAllowed, function (req, res) {
            res.locals = { title: 'Flot Chart' };
            res.render('Charts/charts-flot');
      });
      app.get('/charts-knob', isUserAllowed, function (req, res) {
            res.locals = { title: 'Jquery Knob Chart' };
            res.render('Charts/charts-knob');
      });
      app.get('/charts-sparkline', isUserAllowed, function (req, res) {
            res.locals = { title: 'Sparkline Chart' };
            res.render('Charts/charts-sparkline');
      });

      // Icons
      app.get('/icons-boxicons', isUserAllowed, function (req, res) {
            res.locals = { title: 'Boxicons' };
            res.render('Icons/icons-boxicons');
      });
      app.get('/icons-materialdesign', isUserAllowed, function (req, res) {
            res.locals = { title: 'Material Design' };
            res.render('Icons/icons-materialdesign');
      });
      app.get('/icons-dripicons', isUserAllowed, function (req, res) {
            res.locals = { title: 'Dripicons' };
            res.render('Icons/icons-dripicons');
      });
      app.get('/icons-fontawesome', isUserAllowed, function (req, res) {
            res.locals = { title: 'Font Awesome' };
            res.render('Icons/icons-fontawesome');
      });

      // Maps
      app.get('/maps-google', isUserAllowed, function (req, res) {
            res.locals = { title: 'Google Maps' };
            res.render('Maps/maps-google');
      });
      app.get('/maps-vector', isUserAllowed, function (req, res) {
            res.locals = { title: 'Vector Maps' };
            res.render('Maps/maps-vector');
      });
      
}